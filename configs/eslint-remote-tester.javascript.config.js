const repositories = require('./repositories.json');
const pathIgnorePattern = require('./pathIgnorePattern');

module.exports = {
    /** Repositories to scan */
    repositories,

    /** Extensions of files under scanning */
    extensions: ['js', 'jsx'],

    /** Optional pattern used to exclude paths */
    pathIgnorePattern,

    /** Rules used to filter out results */
    rulesUnderTesting: [],

    /** Optional syntax for the result parser. Valid values are plaintext, markdown. Defaults to markdown on CLI, plaintext on CI */
    resultParser: undefined,

    /** Maximum amount of tasks ran concurrently */
    concurrentTasks: 3,

    /** ESLint configuration */
    eslintrc: {
        root: true,
        env: {
            es6: true,
            node: true,
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
            jest: {
                version: 26,
            },
        },
        plugins: [
            'cypress',
            'jest-dom',
            'jest',
            'jsx-a11y',
            'mocha',
            'node',
            'prettier',
            'react-hooks',
            'react-redux',
            'react',
            'sonarjs',
            'testing-library',
            'unicorn',
        ],
        extends: [
            'eslint:all',
            'plugin:cypress/recommended',
            'plugin:jest-dom/recommended',
            'plugin:jest/all',
            'plugin:jsx-a11y/recommended',
            'plugin:mocha/recommended',
            'plugin:node/recommended',
            'plugin:prettier/recommended',
            'plugin:react-hooks/recommended',
            'plugin:react-redux/recommended',
            'plugin:react/all',
            'plugin:sonarjs/recommended',
            'plugin:testing-library/react',
            'plugin:unicorn/recommended',
        ],
    },
};
