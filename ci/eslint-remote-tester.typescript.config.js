const repositories = require('../configs/repositories.json');
const pathIgnorePattern = require('../configs/pathIgnorePattern');

module.exports = {
    /** Repositories to scan */
    repositories,

    /** Extensions of files under scanning */
    extensions: ['js', 'jsx', 'ts', 'tsx'],

    /** Optional pattern used to exclude paths */
    pathIgnorePattern,

    /** Rules used to filter out results. Empty for crash results only. */
    rulesUnderTesting: [],

    /** Optional syntax for the result parser. Valid values are plaintext, markdown. Defaults to markdown on CLI, plaintext on CI */
    resultParser: undefined,

    /** Maximum amount of tasks ran concurrently */
    concurrentTasks: 3,

    /** ESLint configuration */
    eslintrc: {
        root: true,
        env: {
            es6: true,
            node: true,
        },
        parser: '@typescript-eslint/parser',
        parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            ecmaFeatures: {
                jsx: true,
            },
        },
        settings: {
            react: {
                version: '16.13.1',
            },
            jest: {
                version: 26,
            },
        },
        plugins: [
            '@typescript-eslint',
            'cypress',
            'jest-dom',
            'jest',
            'jsx-a11y',
            'mocha',
            'node',
            'prettier',
            'react-hooks',
            'react-redux',
            'react',
            'sonarjs',
            'testing-library',
            'unicorn',
        ],
        extends: [
            'eslint:all',
            'plugin:@typescript-eslint/all',
            'plugin:cypress/recommended',
            'plugin:jest-dom/recommended',
            'plugin:jest/all',
            'plugin:jsx-a11y/recommended',
            'plugin:mocha/recommended',
            'plugin:node/recommended',
            'plugin:prettier/recommended',
            'plugin:react-hooks/recommended',
            'plugin:react-redux/recommended',
            'plugin:react/all',
            'plugin:sonarjs/recommended',
            'plugin:testing-library/react',
            'plugin:unicorn/recommended',
        ],
        rules: {
            // Disable all rules which require type information since adding
            // project specific parserOptions.project is not supported
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
            '@typescript-eslint/no-throw-literal': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/return-await': 'off',
        },
    },
};
