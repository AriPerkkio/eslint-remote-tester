/** @type {import('../../src/config/types').Config} */
const config = {
    repositories: ['AriPerkkio/eslint-remote-tester-integration-test-target'],
    extensions: ['.js'],
    rulesUnderTesting: [
        'local-rules/verbose-rule',
        'local-rules/verbose-rule-2',
    ],
    eslintConfig: `async function initialize() {
        const { FlatCompat } = await import('@eslint/eslintrc');
        const compat = new FlatCompat({ baseDirectory: process.cwd() });

        return [
            ...compat.plugins('eslint-plugin-local-rules'),
            { rules: { 'local-rules/verbose-rule': 'error' } },
        ];
    }`,
};

export default config;
