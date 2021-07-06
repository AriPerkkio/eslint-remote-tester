const fs = require('fs');
const { resolve } = require('path');
const { execSync } = require('child_process');
const {
    getRepositories,
    getPathIgnorePattern,
} = require('eslint-remote-tester-repositories');

const TS_CONFIG_PATTERN = /tsconfig\.json/;

module.exports = {
    repositories: getRepositories().slice(0, 15),

    extensions: ['js', 'jsx', 'ts', 'tsx'],

    pathIgnorePattern: getPathIgnorePattern(),

    maxFileSizeBytes: undefined,

    rulesUnderTesting: [],

    resultParser: undefined,

    concurrentTasks: 3,

    eslintrc: function initializeLinter(options) {
        const eslintrc = {
            root: true,
            env: {
                es6: true,
            },
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            extends: ['eslint:recommended'],
        };

        if (options) {
            const tsconfig = findTsConfig(options);

            if (tsconfig) {
                eslintrc.parserOptions.tsconfigRootDir = options.location;
                eslintrc.parserOptions.project = [tsconfig];
                eslintrc.plugins = ['@typescript-eslint'];
                eslintrc.extends = ['plugin:@typescript-eslint/all'];

                try {
                    execSync('yarn install --ignore-scripts --ignore-engines', {
                        cwd: options.location,
                        stdio: 'ignore',
                    });
                } catch (e) {
                    // Ignore
                }
            }
        }

        return eslintrc;
    },

    cache: true,

    compare: false,

    updateComparisonReference: true,
};

function findTsConfig(options) {
    if (!options) return undefined;

    const tsconfig = fs
        .readdirSync(options.location)
        .find(file => TS_CONFIG_PATTERN.test(file));

    if (tsconfig) {
        return resolve(options.location, tsconfig);
    }
}
