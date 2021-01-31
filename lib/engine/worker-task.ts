import { parentPort, workerData } from 'worker_threads';
import { ESLint, Linter } from 'eslint';
import { codeFrameColumns, SourceLocation } from '@babel/code-frame';

import { LintMessage, WorkerData } from './types';
import config from '@config';
import { getFiles, removeCachedRepository, SourceFile } from '@file-client';

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
    | { type: 'PULL_FAILURE' }
    | { type: 'DEBUG'; payload: any };

// Regex used to attempt parsing out rule which caused linter to crash
const RULE_REGEXP = /rules\/(.*?)\.js/;
const UNKNOWN_RULE_ID = 'unable-to-parse-rule-id';

// Regex used to attempt parsing out line which caused linter to crash
const LINE_REGEX = /while linting <text>:(([0-9]+)?)/;

const MAX_LINT_TIME_SECONDS = 5;

/**
 * Create error message for LintMessage results
 */
export function createErrorMessage(
    error: Omit<LintMessage, 'column' | 'line' | 'severity'> & { line?: number }
): LintMessage {
    return {
        line: 0,
        ...error,
        column: 0,
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

    return [
        ...all,
        ...messages.map(message => ({
            ...message,
            source: constructCodeFrame(result.source, message),
        })),
    ];
}

/**
 * Build code frame from ESLint result, if possible
 */
function constructCodeFrame(
    source: ESLint.LintResult['source'],
    message: Linter.LintMessage
): Linter.LintMessage['source'] {
    if (!source) return undefined;

    const location: SourceLocation = {
        start: { line: message.line, column: message.column },
    };

    if (message.endLine != null) {
        location.end = { line: message.endLine, column: message.endColumn };
    }

    return codeFrameColumns(source, location);
}

/**
 * Parse error stack for erroneous lines and construct `LintMessage` with
 * source code.
 */
function parseErrorStack(error: Error, file: SourceFile): LintMessage {
    const { content, path } = file;

    const stack = error.stack || '';
    const ruleMatch = stack.match(RULE_REGEXP) || [];
    const ruleId = ruleMatch.pop() || UNKNOWN_RULE_ID;

    const lineMatch = stack.match(LINE_REGEX) || [];
    const line = parseInt(lineMatch.pop() || '0');

    // Include erroneous line to source when line was successfully parsed from the stack
    const source =
        line > 0 ? codeFrameColumns(content, { start: { line } }) : undefined;

    return createErrorMessage({
        path,
        line,
        ruleId,
        source,
        error: error.stack,
        message: error.message,
    });
}

// Wrapper used to enfore WorkerMessage type to parentPort.postMessage calls
const postMessage = (message: WorkerMessage) => {
    if (parentPort) {
        return parentPort.postMessage(message);
    }
    throw new Error(`parentPort unavailable, message: (${message})`);
};

/**
 * Task for worker threads:
 * - Expects workerData to contain array of repositories as strings
 * - Read files from repository-client
 * - Run ESLint on file contents
 * - Parse messages and pass lint results back to the main thread
 * - Keep progress-logger up-to-date of status via onMessage
 */
export default async function workerTask(): Promise<void> {
    const linter = new ESLint({
        useEslintrc: false,
        overrideConfig: config.eslintrc,
    });

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
            const crashError = parseErrorStack(error, file);

            results.push(crashError);
            postMessage({ type: 'FILE_LINT_END', payload: index + 1 });
            postMessage({
                type: 'LINTER_CRASH',
                payload: crashError.ruleId || '',
            });

            continue;
        }

        const messages = result
            .reduce(mergeMessagesWithSource, [])
            .filter(Boolean)
            .map(message => ({ ...message, path }));

        results.push(...messages);
        postMessage({ type: 'FILE_LINT_END', payload: index + 1 });
    }

    if (!config.cache) {
        await removeCachedRepository(repository);
    }

    postMessage({ type: 'LINT_END', payload: results });
}
