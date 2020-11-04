module.exports = {
    repositories: [
        'codesandbox/codesandbox-client',
        'AriPerkkio/js-framework-playground',
        'oldboyxx/jira_clone',
        'reach/reach-ui',
        'react-bootstrap/react-bootstrap',
        'StreakYC/react-smooth-collapse',
        'pmndrs/react-spring',
        'AriPerkkio/scrpr',
        'AriPerkkio/state-mgmt-examples',
        'AriPerkkio/suspense-examples',
        'ant-design/ant-design',
        'mui-org/material-ui',
        'withspectrum/spectrum',
        'artsy/force',
        'reactjs/reactjs.org',
        'zesty-io/accounts-ui',
        'zesty-io/design-system',
        'segmentio/evergreen',
        'segmentio/ui-box',
    ],

    extensions: ['js', 'jsx', 'ts', 'tsx'],

    pathIgnorePattern: `(${[
        'node_modules',
        '\\/\\.', // Any file or directory starting with dot, e.g. ".git"
        'test-results',
        'tests',
        'docs',

        // Codesandbox commits minified JS to remote
        'codesandbox-client/packages/app/static/js',
        'codesandbox-client/standalone-packages',
    ].join('|')})`,

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
};
