/** @type {import('../../src/config/types').Config} */
const config = {
    repositories: ['AriPerkkio/eslint-remote-tester-integration-test-target'],
    extensions: ['.js'],
    pathIgnorePattern: '(expected-to-be-excluded)',
    rulesUnderTesting: [
        'no-unreachable',
        'no-undef',
        'no-empty',
        'getter-return',
        'no-compare-neg-zero',
    ],
    eslintConfig: `async function initialize() {
        const { default: js } = await import('@eslint/js');
        const { FlatCompat } = await import('@eslint/eslintrc');
        const compat = new FlatCompat({ baseDirectory: process.cwd() });

        return [
            js.configs.recommended,
            ...compat.plugins('eslint-plugin-local-rules'),
            { rules: { 'local-rules/some-unstable-rule': 'error' } },
        ];
    }`,
};

export default config;
