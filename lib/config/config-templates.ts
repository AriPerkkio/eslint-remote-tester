// prettier-ignore
export const CONFIGURATION_FILE_TEMPLATE =
`module.exports = {
    /** Repositories to scan */
    repositories: ['reactjs/reactjs.org'],

    /** Extensions of files under scanning */
    extensions: ['.js'],

    /** Optional pattern used to exclude paths */
    pathIgnorePattern: \`(\${[
        'node_modules',
        '\\/\\.', // Any file or directory starting with dot, e.g. ".git"
        'test-results',
        'tests',
        'docs',
    ].join('|')})\`,

    /** Optional max file size (bytes) used to exclude bigger files. Defaults to 2 megabytes. */
    maxFileSizeBytes: 2000000,

    /** Optional array of rules used to filter out results. Use undefined or empty array when ESLint crashes are the only interest */
    rulesUnderTesting: ['react/no-direct-mutation-state'],

    /** Optional syntax for the result parser. Valid values are plaintext, markdown. Defaults to markdown on CLI, plaintext on CI */
    resultParser: 'markdown',

    /** Maximum amount of tasks ran concurrently */
    concurrentTasks: 5,

    /** ESLint configuration */
    eslintrc: {
        root: true,
        env: {
            es6: true,
        },
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
        },
        plugins: ['react'],
        rules: {
            'react/no-direct-mutation-state': ['error'],
        },
    },

    /** Optional boolean flag used to set CI mode. process.env.CI is used when not set. */
    CI: false,

    /** Optional setting for log level. Valid values are verbose, info, warn, error. Defaults to verbose. */
    logLevel: 'verbose',

    /** Optional boolean flag used to enable caching of cloned repositories. For CIs it's ideal to disable caching. Defaults to true. */
    cache: true,

    /** Optional time limit in seconds for the scan. Scan is interrupted after reaching the limit. Defaults to 5 hours 30 minutes. */
    timeLimit: 5.5 * 60 * 60, // 5 hours 30 minutes

    /** Optional boolean flag used to enable result comparison. Defaults to false. */
    compare: false,

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
    onComplete: async function onComplete(results, comparisonResults) {
        // Extend the process with custom features, e.g. send results to email, create issues to Github...
    },
}`;
