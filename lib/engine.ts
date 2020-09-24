import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { ESLint } from 'eslint';

import config from './config';
import client from './repository-client';
import { mergeMessagesWithSource } from './results-parser';
import { LintMessage, WorkerMessage } from './types';

const LINT_FAILURE_BASE = {
    column: 0,
    line: 0,
    severity: 0,
} as const;

// Regex used to attempt parsing our rule which caused linter to crash
const RULE_REGEXP = /rules\/(.*?)\.js/;

/**
 * Task for worker threads:
 * - Read files from repository-client
 * - Run ESLint on file contents
 * - Parse messages and pass lint results back to the main thread
 * - Keep process-logger up-to-date of status via onMessage
 */
if (!isMainThread) {
    (async function lintRepositorysFiles() {
        // Wrapper used to enfore WorkerMessage type to parentPort.postMessage calls
        const postMessage = (message: WorkerMessage) =>
            parentPort.postMessage(message);

        const files = await client.getFiles({
            repository: workerData,
            onClone: () => postMessage({ type: 'CLONE' }),
            onCloneFailure: () => postMessage({ type: 'CLONE_FAILURE' }),
            onRead: () => postMessage({ type: 'READ' }),
            onReadFailure: () => postMessage({ type: 'READ_FAILURE' }),
        });

        const linter = new ESLint({
            useEslintrc: false,
            overrideConfig: config.eslintrc,
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
    })();
}

/**
 * Start scanning of given repository in a separate thread
 * - Keeps process-logger up-to-date via onMessage
 */
function scanRepository(
    repository: string,
    onMessage: (message: WorkerMessage) => void
): Promise<LintMessage[]> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, { workerData: repository });

        worker.on('message', (message: WorkerMessage) => {
            switch (message.type) {
                case 'LINT_END':
                    return resolve(message.payload);

                default:
                    return onMessage(message);
            }
        });

        // TODO handle error cases with descriptive status messages
        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

export default { scanRepository };
