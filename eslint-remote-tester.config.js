module.exports = {
    repositories: [
        'AriPerkkio/js-framework-playground',
        'oldboyxx/jira_clone',
        'reach/reach-ui',
        'react-bootstrap/react-bootstrap',
        'StreakYC/react-smooth-collapse',
        'react-spring/react-spring',
        'AriPerkkio/scrpr',
        'AriPerkkio/state-mgmt-examples',
        'AriPerkkio/suspense-examples',
        'ant-design/ant-design',
        'mui-org/material-ui',
        'withspectrum/spectrum',
        'codesandbox/codesandbox-client',
        'Automattic/wp-calypso',
        'vercel/next-site',
        'artsy/force',
        'reactjs/reactjs.org',
        'zesty-io/accounts-ui',
        'zesty-io/design-system',
        'segmentio/evergreen',
        'segmentio/ui-box',
    ],

    extensions: ['js', 'jsx', 'ts', 'tsx'],

    pathIgnorePattern: "(node_modules|^\\.|test-results)",

    rulesUnderTesting: ['react/no-direct-mutation-state'],

    resultParser: undefined,

    concurrentTasks: 5,

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
        extends: ['plugin:react/all'],
        rules: {
            'react/no-direct-mutation-state': ['error'],
        },
    },
};
