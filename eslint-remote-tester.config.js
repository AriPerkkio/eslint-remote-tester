const {
    getRepositories,
    getPathIgnorePattern,
} = require('eslint-remote-tester-repositories');

module.exports = {
    repositories: getRepositories().slice(0, 15),

    extensions: ['js', 'jsx', 'ts', 'tsx'],

    pathIgnorePattern: getPathIgnorePattern(),

    maxFileSizeBytes: undefined,

    rulesUnderTesting: [],

    resultParser: undefined,

    concurrentTasks: 3,

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
        extends: ['eslint:recommended'],
    },

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
