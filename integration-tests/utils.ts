const CLI_CONFIGURATION_LOCATION =
    'integration-tests/eslint-remote-tester.integration.cli.config.js';
export const CI_CONFIGURATION_LOCATION =
    'integration-tests/eslint-remote-tester.integration.ci.config.js';

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

// Mimics @testing-library's waitFor
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
