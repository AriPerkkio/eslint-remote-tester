const fs = require('fs');
const { resolve } = require('path');
const { execSync } = require('child_process');

const baseConfig = require('../base.config');

module.exports = {
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
            rules: {
                ...baseEslintrc.rules,
                ...rulesWithoutTypeAware,
            },
        };
    },
};

const TS_CONFIG_PATTERN = /tsconfig\.json/;

function findTsConfig(options) {
    if (!fs.existsSync(options.location)) return null;

    const tsconfig = fs
        .readdirSync(options.location)
        .find(file => TS_CONFIG_PATTERN.test(file));

    if (tsconfig) {
        return resolve(options.location, tsconfig);
    }
}

const baseEslintrc = {
    ...baseConfig.eslintrc,
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/all'],
    rules: {
        // https://github.com/typescript-eslint/typescript-eslint/issues/3933
        '@typescript-eslint/no-restricted-imports': ['error', {}],
    },
};

const rulesWithoutTypeAware = {
    '@typescript-eslint/await-thenable': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-base-to-string': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-for-in-array': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-unnecessary-qualifier': 'off',
    '@typescript-eslint/no-unnecessary-type-arguments': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/prefer-includes': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/prefer-readonly': 'off',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/prefer-reduce-type-parameter': 'off',
    '@typescript-eslint/prefer-regexp-exec': 'off',
    '@typescript-eslint/prefer-string-starts-ends-with': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/require-array-sort-compare': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/non-nullable-type-assertion-style': 'off',
    '@typescript-eslint/prefer-return-this-type': 'off',
    '@typescript-eslint/no-meaningless-void-operator': 'off',
    '@typescript-eslint/consistent-type-exports': 'off',
};
