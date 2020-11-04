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
    resultParser: undefined,
    concurrentTasks: undefined,
    eslintrc: {
        root: true,
        extends: ['eslint:recommended'],
    },
};
