import { parentPort, workerData } from 'worker_threads';
import { ESLint, Linter } from 'eslint';

import config from '../config';
import { getFiles } from '../file-client';
import { LintMessage } from './types';

export type WorkerMessage =
    | { type: 'START' }
    | { type: 'READ' }
    | { type: 'CLONE' }
    | { type: 'LINT_START'; payload: number }
    | { type: 'LINT_END'; payload: LintMessage[] }
    | { type: 'FILE_LINT_END'; payload: number }
    | { type: 'LINTER_CRASH'; payload: string }
    | { type: 'READ_FAILURE' }
    | { type: 'CLONE_FAILURE' };

const LINT_FAILURE_BASE = {
    column: 0,
    line: 0,
    severity: 0,
} as const;

// Regex used to attempt parsing out rule which caused linter to crash
const RULE_REGEXP = /rules\/(.*?)\.js/;
const SOURCE_WINDOW_SIZE = 10;

/**
 * Picks out messages which are under testing and constructs a small snippet of
 * the erroneous code block
 */
function mergeMessagesWithSource(
    all: Linter.LintMessage[],
    result: ESLint.LintResult
): Linter.LintMessage[] {
    const messages = result.messages.filter(
        message =>
            message.ruleId && config.rulesUnderTesting.includes(message.ruleId)
    );

    // Process only rules that are under testing
    if (messages.length === 0) {
        return all;
    }

    const sourceLines = result.source ? result.source.split('\n') : [];
    const sourceLinesPadding = Math.abs(SOURCE_WINDOW_SIZE / 2);

    return [
        ...all,
        ...messages.map(message => ({
            ...message,
            // Construct small snippet of the erroneous code block
            source: sourceLines
                .slice(
                    Math.max(0, message.line - sourceLinesPadding),
                    Math.min(
                        sourceLines.length,
                        sourceLinesPadding + (message.endLine || 0)
                    )
                )
                .join('\n'),
        })),
    ];
}

// Wrapper used to enfore WorkerMessage type to parentPort.postMessage calls
const postMessage = (message: WorkerMessage) => parentPort.postMessage(message);

const linter = new ESLint({
    useEslintrc: false,
    overrideConfig: config.eslintrc,
});

/**
 * Task for worker threads:
 * - Expects workerData to contain array of repositories as strings
 * - Read files from repository-client
 * - Run ESLint on file contents
 * - Parse messages and pass lint results back to the main thread
 * - Keep progress-logger up-to-date of status via onMessage
 */
export default async function workerTask(): Promise<void> {
    const files = await getFiles({
        repository: workerData,
        onClone: () => postMessage({ type: 'CLONE' }),
        onCloneFailure: () => postMessage({ type: 'CLONE_FAILURE' }),
        onRead: () => postMessage({ type: 'READ' }),
        onReadFailure: () => postMessage({ type: 'READ_FAILURE' }),
    });

    const results: LintMessage[] = [];
    postMessage({ type: 'LINT_START', payload: files.length });

    for (const [index, file] of files.entries()) {
        const { content, path } = file;
        let result;

        try {
            result = await linter.lintText(content);
        } catch (error) {
            // Catch crashing linter
            const stack = error.stack || '';
            const ruleMatch = stack.match(RULE_REGEXP) || [];
            const ruleId = ruleMatch.pop();

            results.push({
                ...LINT_FAILURE_BASE,
                path,
                message: error.message,
                source: error.stack,
                ruleId,
            });
            postMessage({ type: 'LINTER_CRASH', payload: ruleId });
            continue;
        }

        const messages = result
            .reduce(mergeMessagesWithSource, [])
            .filter(Boolean)
            .map(message => ({ ...message, path }));

        results.push(...messages);
        postMessage({ type: 'FILE_LINT_END', payload: index + 1 });
    }

    postMessage({ type: 'LINT_END', payload: results });
}
