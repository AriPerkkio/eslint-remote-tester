const repositories = require('../configs/repositories.json');
const pathIgnorePattern = require('../configs/pathIgnorePattern');

module.exports = {
    repositories: process.env.CI ? repositories : [repositories[0]],
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    pathIgnorePattern,
    rulesUnderTesting: [],
    resultParser: 'markdown',
    concurrentTasks: 3,
    logLevel: process.env.CI ? 'info' : 'verbose',
    cache: process.env.CI ? false : true,
    CI: true,
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
