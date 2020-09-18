import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { ESLint, Linter } from 'eslint';

import config from './config';
import { LintMessage, SourceFile } from './types';

function mergeMessagesWithSource(
    all: Linter.LintMessage[],
    result: ESLint.LintResult
) {
    const messages = result.messages.filter(
        message =>
            message.ruleId && config.rulesUnderTesting.includes(message.ruleId)
    );

    // Process only rules that are under testing
    if (messages.length === 0) {
        return all;
    }

    const sourceLines = result.source ? result.source.split('\n') : [];

    return [
        ...all,
        ...messages.map(message => ({
            ...message,
            // Construct small snippet of the erroneous code block
            source: sourceLines
                .slice(
                    Math.max(0, message.line - 2),
                    Math.min(sourceLines.length, 2 + (message.endLine || 0))
                )
                .join('\n'),
        })),
    ];
}

if (!isMainThread) {
    (async function lint() {
        const files: SourceFile[] = workerData;

        const linter = new ESLint({
            useEslintrc: false,
            overrideConfig: config.eslintrc,
        });

        const results: LintMessage[] = [];

        for (const [index, file] of files.entries()) {
            const { content, path } = file;

            const result = await linter.lintText(content);
            const messages = result
                .reduce(mergeMessagesWithSource, [])
                .filter(Boolean)
                .map(message => ({ ...message, path }));

            results.push(...messages);
            parentPort.postMessage(index + 1);
        }

        parentPort.postMessage(results);
    })();
}

function lintFiles(
    files: SourceFile[],
    onFileLinted: (i: number) => void
): Promise<LintMessage[]> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, { workerData: files });

        worker.on('message', (results: number | LintMessage[]) => {
            if (typeof results === 'number') {
                onFileLinted(results);
            } else {
                resolve(results);
            }
        });
        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

export default { lintFiles };
