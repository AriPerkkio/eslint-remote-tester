import js from '@eslint/js';
import type { Config } from './src/types';

export default defineConfig({
    repositories: [
        'AriPerkkio/eslint-remote-tester-integration-test-target',
        'AriPerkkio/aria-live-capture',
        'AriPerkkio/extend-to-be-announced',
        'AriPerkkio/state-mgmt-examples',
        'AriPerkkio/suspense-examples',
    ],

    extensions: ['js', 'jsx', 'ts', 'tsx'],

    maxFileSizeBytes: undefined,

    rulesUnderTesting: [],

    resultParser: undefined,

    concurrentTasks: 3,

    eslintConfig: [js.configs.recommended] as any,

    cache: true,

    compare: false,

    updateComparisonReference: true,

    onComplete: undefined,
});

function defineConfig(config: Config) {
    return config;
}
