const repositories = require('../configs/repositories.json');
const pathIgnorePattern = require('../configs/pathIgnorePattern');

function shuffle(array) {
    return array
        .map(value => ({ value, order: Math.random() }))
        .sort((a, b) => a.order - b.order)
        .map(({ value }) => value);
}

module.exports = {
    repositories: process.env.CI ? shuffle(repositories) : [repositories[0]],
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    pathIgnorePattern,
    rulesUnderTesting: [],
    resultParser: 'markdown',
    concurrentTasks: 3,
    logLevel: process.env.CI ? 'info' : 'verbose',
    cache: process.env.CI ? false : true,
    timeLimit: 5.9 * 60 * 60,
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
