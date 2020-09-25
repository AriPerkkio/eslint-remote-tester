// prettier-ignore
export const CONFIGURATION_FILE_TEMPLATE =
`module.exports = {
    /** Repositories to scan */
    repositories: ['reactjs/reactjs.org'],

    /** Extensions of files under scanning */
    extensions: ['.js'],

    /** Optional pattern used to exclude paths */
    pathIgnorePattern: "(node_modules|^\\\\.|test-results)",

    /** Rules used to filter out results */
    rulesUnderTesting: ['react/no-direct-mutation-state'],

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
    }
}`;
