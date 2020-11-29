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

    /** Rules used to filter out results */
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

    /** Optional boolean flag used to enable caching of cloned repositories. For CIs it's ideal to disable caching. Defauls to true. */
    cache: true,

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
     * @returns {Promise<void>|void}
     */
    onComplete: async function onComplete(results) {

    },
}`;
