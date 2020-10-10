import { parentPort, workerData } from 'worker_threads';
import { ESLint, Linter } from 'eslint';

import config from '../config';
import { getFiles } from '../file-client';
import { LintMessage, WorkerData } from './types';

export type WorkerMessage =
    | { type: 'START' }
    | { type: 'READ' }
    | { type: 'CLONE' }
    | { type: 'PULL' }
    | { type: 'LINT_START'; payload: number }
    | { type: 'LINT_END'; payload: LintMessage[] }
    | { type: 'FILE_LINT_END'; payload: number }
    | { type: 'FILE_LINT_SLOW'; payload: { path: string; lintTime: number } }
    | { type: 'LINTER_CRASH'; payload: string }
    | { type: 'WORKER_ERROR'; payload?: string }
    | { type: 'READ_FAILURE' }
    | { type: 'CLONE_FAILURE' }
    | { type: 'PULL_FAILURE' };

// Regex used to attempt parsing out rule which caused linter to crash
const RULE_REGEXP = /rules\/(.*?)\.js/;
const SOURCE_WINDOW_SIZE = 10;
const MAX_LINT_TIME_SECONDS = 5;

/**
 * Create error message for LintMessage results
 */
export function createErrorMessage(
    error: Omit<LintMessage, 'column' | 'line' | 'severity'>
): LintMessage {
    return {
        ...error,
        column: 0,
        line: 0,
        severity: 0,
    };
}

async function executionTimeWarningWrapper<T>(
    method: () => Promise<T>,
    warningMethod: (executionTime: number) => void,
    time: number
): Promise<T> {
    const startTime = process.hrtime();
    const results = await method();
    const [endTime] = process.hrtime(startTime);

    if (endTime > time) {
        warningMethod(endTime);
    }

    return results;
}

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
const postMessage = (message: WorkerMessage) => {
    if (parentPort) {
        return parentPort.postMessage(message);
    }
    throw new Error(`parentPort unavailable, message: (${message})`);
};

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
    const { repository } = workerData as WorkerData;

    const files = await getFiles({
        repository,
        onClone: () => postMessage({ type: 'CLONE' }),
        onCloneFailure: () => postMessage({ type: 'CLONE_FAILURE' }),
        onPull: () => postMessage({ type: 'PULL' }),
        onPullFailure: () => postMessage({ type: 'PULL_FAILURE' }),
        onRead: () => postMessage({ type: 'READ' }),
        onReadFailure: () => postMessage({ type: 'READ_FAILURE' }),
    });

    const results: LintMessage[] = [];
    postMessage({ type: 'LINT_START', payload: files.length });

    for (const [index, file] of files.entries()) {
        const { content, path } = file;
        let result: ESLint.LintResult[];

        try {
            result = await executionTimeWarningWrapper(
                () => linter.lintText(content),

                // Warn about files taking more than 5s to lint
                // Useful to identify minified files commited to remote
                lintTime =>
                    postMessage({
                        type: 'FILE_LINT_SLOW',
                        payload: { path, lintTime },
                    }),
                MAX_LINT_TIME_SECONDS
            );
        } catch (error) {
            // Catch crashing linter
            const stack = error.stack || '';
            const ruleMatch = stack.match(RULE_REGEXP) || [];
            const ruleId = ruleMatch.pop();

            results.push(
                createErrorMessage({
                    path,
                    message: error.message,
                    source: error.stack,
                    ruleId,
                })
            );
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
