const CLI_CONFIGURATION_LOCATION =
    'test/integration/eslint-remote-tester.integration.cli.config.js';
export const CI_CONFIGURATION_LOCATION =
    'test/integration/eslint-remote-tester.integration.ci.config.js';
export const INTEGRATION_REPO_OWNER = 'AriPerkkio';
export const INTEGRATION_REPO_NAME =
    'eslint-remote-tester-integration-test-target';

/**
 * Import the actual production build and run it
 */
export async function runProductionBuild(): Promise<void> {
    // Clear possible previous runs results
    resetConsoleLogCalls();
    resetStdoutMethodCalls();
    resetExitCalls();
    jest.resetModules();

    const { __handleForTests } = require('../dist/index');
    return __handleForTests;
}

/**
 * Replace config from argv's with given location
 */
export function setConfig(configLocation?: string): void {
    const configIndex = process.argv.findIndex(a => a === '--config');
    const config = configLocation || CLI_CONFIGURATION_LOCATION;

    if (configIndex !== -1) {
        process.argv[configIndex + 1] = config;
    } else {
        process.argv.push('--config', config);
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
    const calls: string[][] = (console.log as jest.Mock).mock.calls;

    return calls.map(argumentArray => argumentArray[0]);
}

/**
 * Reset captured calls of `console.log`
 */
export function resetConsoleLogCalls(): void {
    (console.log as jest.Mock).mockClear();
}

/**
 * Get call arguments of `process.stdout.write`
 */
export function getStdoutWriteCalls(): string[] {
    const calls: string[][] = (process.stdout.write as jest.Mock).mock.calls;

    return calls.map(argumentArray => argumentArray[0]);
}

/**
 * Reset captured calls of `process.stdout.write`
 */
export function resetStdoutMethodCalls(): void {
    (process.stdout.write as jest.Mock).mockClear();
}

/**
 * Get call arguments of `process.exit`
 */
export function getExitCalls(): string[] {
    const calls: string[][] = ((process.exit as any) as jest.Mock).mock.calls;

    return calls.map(argumentArray => argumentArray[0]);
}

/**
 * Reset captured calls of `process.exit`
 */
export function resetExitCalls(): void {
    ((process.exit as any) as jest.Mock).mockClear();
}
