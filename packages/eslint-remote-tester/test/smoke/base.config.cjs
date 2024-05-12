module.exports = {
    repositories: ['AriPerkkio/eslint-remote-tester-integration-test-target'],
    extensions: ['.js'],
    rulesUnderTesting: [
        'local-rules/verbose-rule',
        'local-rules/verbose-rule-2',
    ],
    eslintrc: {
        root: true,
        plugins: ['local-rules'],
        rules: {
            'local-rules/verbose-rule': 'error',
        },
    },
};
