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

    logLevel: 'info',

    cache: false,

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
    },
};
