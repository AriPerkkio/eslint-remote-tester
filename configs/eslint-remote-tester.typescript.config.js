const repositories = require('./repositories.json');
const pathIgnorePattern = require('./pathIgnorePattern');

module.exports = {
    /** Repositories to scan */
    repositories,

    /** Extensions of files under scanning */
    extensions: ['ts', 'tsx'],

    /** Optional pattern used to exclude paths */
    pathIgnorePattern,

    /** Rules used to filter out results */
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
        },
        plugins: [
            'node',
            'react',
            'react-hooks',
            '@typescript-eslint',
            'prettier',
        ],
        extends: [
            'eslint:all',
            'plugin:react/all',
            'plugin:react-hooks/recommended',
            'plugin:prettier/recommended',
            'plugin:@typescript-eslint/all',
            'plugin:node/recommended',
            'prettier/@typescript-eslint',
        ],
        rules: {
            // Disable all '...a rule which requires parserServices to be generated...'
            // since adding project specific parserOptions.project is not supported
            '@typescript-eslint/await-thenable': 'off',
            '@typescript-eslint/dot-notation': 'off',
            '@typescript-eslint/no-base-to-string': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-implied-eval': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-throw-literal': 'off',
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
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/restrict-plus-operands': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/return-await': 'off',
            '@typescript-eslint/strict-boolean-expressions': 'off',
            '@typescript-eslint/switch-exhaustiveness-check': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-for-in-array': 'off',
        },
    },
};
