module.exports = {
    repositories: ['AriPerkkio/eslint-remote-tester-integration-test-target'],
    extensions: ['.js'],
    pathIgnorePattern: '(expected-to-be-excluded)',
    rulesUnderTesting: [
        'no-reachable',
        'no-undef',
        'no-empty',
        'getter-return',
        'no-compare-neg-zero',
    ],
    resultParser: 'markdown',
    concurrentTasks: 5,
    eslintrc: {
        root: true,
        extends: ['eslint:recommended'],
    },
    CI: false,
};
