import * as fs from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { Linter } from 'eslint';
import type { Config } from 'eslint-remote-tester';

import baseConfig from '../base.config';

const baseEslintrc = baseConfig.eslintrc as Linter.Config;

const config: Config = {
    ...baseConfig,
    concurrentTasks: 1,
    eslintrc: function initializeLinter(options) {
        if (options) {
            const tsConfigLocation = findTsConfig(options);

            if (tsConfigLocation) {
                // Attempt to install project dependencies and enable all rules from plugin.
                // This step may fail if dependencies cannot be installed without additional manual steps.
                try {
                    execSync('yarn cache clean', {
                        cwd: options.location,
                        stdio: 'ignore',
                    });

                    execSync('yarn install --ignore-scripts --ignore-engines', {
                        cwd: options.location,
                        stdio: 'ignore',
                    });

                    return {
                        ...baseEslintrc,
                        plugins: ['@typescript-eslint'],
                        extends: ['plugin:@typescript-eslint/all'],
                        parserOptions: {
                            ...baseEslintrc.parserOptions,
                            tsconfigRootDir: options.location,
                            project: [tsConfigLocation],
                        },
                    };
                } catch (e) {
                    // Fallback to non-type-aware ruleset when dependency installation fails
                }
            }
        }

        return {
            ...baseEslintrc,
            plugins: ['@typescript-eslint'],
            extends: [
                'plugin:@typescript-eslint/all',
                'plugin:@typescript-eslint/disable-type-checked',
            ],
        };
    },
};

const TS_CONFIG_PATTERN = /tsconfig\.json/;

function findTsConfig(options: { repository: string; location: string }) {
    if (!fs.existsSync(options.location)) return null;

    const tsconfig = fs
        .readdirSync(options.location)
        .find(file => TS_CONFIG_PATTERN.test(file));

    if (tsconfig) {
        return resolve(options.location, tsconfig);
    }
}

export default config;
