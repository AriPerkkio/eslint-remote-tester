import js from '@eslint/js';

/** @type {import('./src/config/types').Config} */
const config = {
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

    eslintConfig: [js.configs.recommended],

    cache: true,

    compare: false,

    updateComparisonReference: true,

    /**
     * Optional callback invoked once scan is complete.
     *
     * @param {{
     *     repository: string,
     *     repositoryOwner: string,
     *     rule: string,
     *     message: string,
     *     path: string,
     *     link: string,
     *     extension: string,
     *     source: string,
     *     error: (string|undefined),
     * }[]} results Results of the scan, if any
     *
     * @param {{
     *     added: {}[],
     *     removed: {}[]
     * }} comparisonResults Comparison results of the scan, if any
     * @returns {Promise<void>|void}
     */
    onComplete: undefined,
};

export default config;
