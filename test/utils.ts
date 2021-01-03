import { ResultTemplateOptions } from '@file-client/result-templates';

declare const global: typeof globalThis & { onComplete: jest.Mock };
declare const console: { log: jest.Mock };
declare const process: {
    stdout: { write: jest.Mock; rows: number; columns: number };
    exit: jest.Mock;
    argv: string[];
    cwd: () => string;
};

export const INTEGRARION_CONFIGURATION_LOCATION =
    'test/integration/eslint-remote-tester.integration.config.js';
export const INTEGRATION_REPO_OWNER = 'AriPerkkio';
export const INTEGRATION_REPO_NAME =
    'eslint-remote-tester-integration-test-target';

/**
 * Import the actual production build and run it
 */
export async function runProductionBuild(): Promise<void> {
    jest.resetModules();

    const { __handleForTests } = require('../dist/index');
    await __handleForTests;

    return waitFor(() => getExitCalls().length > 0);
}

/**
 * Replace config from argv's with integration config's location
 */
export function setConfig(): void {
    const configIndex = process.argv.findIndex(a => a === '--config');

    if (configIndex !== -1) {
        process.argv[configIndex + 1] = INTEGRARION_CONFIGURATION_LOCATION;
    } else {
        process.argv.push('--config', INTEGRARION_CONFIGURATION_LOCATION);
    }
}

/**
 * Wait until given method returns true
 * - Mimics `@testing-library`'s waitFor
 */
export async function waitFor(predicate: () => boolean): Promise<void> {
    return new Promise(resolve => {
        function checkForPredicate() {
            setTimeout(() => {
                if (predicate()) {
                    resolve();
                } else {
                    checkForPredicate();
                }
            }, 100);
        }

        checkForPredicate();
    });
}

/**
 * Get call arguments of `console.log`
 */
export function getConsoleLogCalls(): string[] {
    const calls: string[][] = console.log.mock.calls;
    console.log.mockClear();

    return calls.map(argumentArray => argumentArray[0]);
}

/**
 * Get call arguments of `process.stdout.write`
 */
export function getStdoutWriteCalls(): string[] {
    const calls: string[][] = process.stdout.write.mock.calls;
    process.stdout.write.mockClear();

    return calls.map(argumentArray => argumentArray[0]);
}

/**
 * Get call arguments of `process.exit`
 */
export function getExitCalls(): string[] {
    const calls: string[][] = process.exit.mock.calls;

    return calls.map(argumentArray => argumentArray[0]);
}

/**
 * Get call arguments of `global.onComplete`
 */
export function getOnCompleteCalls(): ResultTemplateOptions[][] {
    const calls: ResultTemplateOptions[][][] = global.onComplete.mock.calls;
    global.onComplete.mockClear();

    return calls.map(argumentArray => argumentArray[0]);
}

/**
 * Sanitize possible stack traces for sensitive paths
 * - Removes absolute root path from stack traces, e.g.
 *   `/home/username/path/to/project/...` -> `<removed>/...`
 * - Guarantees identical stack traces between environments
 */
export function sanitizeStackTrace(message?: string): string {
    return (message || '').replace(new RegExp(process.cwd(), 'g'), '<removed>');
}
