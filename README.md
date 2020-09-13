# eslint-remote-tester

`eslint-remote-tester` is a CLI tool for testing given [ESlint](https://github.com/eslint/eslint) rules against multiple repositories at once. It's designed to be used when validating regression of new rules.


![demo](https://github.com/AriPerkkio/eslint-remote-tester/blob/master/media/cli.png)

## Installation
```sh
# In your project directory
$ yarn add --dev eslint-remote-tester
```

## Configuration
### package.json
Add new script to your `package.json` file.
```json
"scripts": {
    "lint:remote": "eslint-remote-tester",
```

### eslint-remote-tester.config.js
Create new configuration file `eslint-remote-tester.config.js` in the root of your project.
```js
module.exports = {
    /** Repositories to scan */
    repositories: [],

    /** Extensions of files under scanning */
    extensions: [],

    /** Rules used to filter out results */
    rulesUnderTesting: [],

    /** Maximum amount of tasks ran concurrently */
    concurrentTasks: 5,

    /** ESLint configuration */
    eslintrc: {}
}
```

### Execution
Run `yarn lint:remote`. Results are written into `./results` folder.

## Example
```js
// eslint-remote-tester.config.js
module.exports = {
    repositories: [
        'ant-design/ant-design',
        'AriPerkkio/js-framework-playground',
        'oldboyxx/jira_clone',
        'mui-org/material-ui',
        'reach/reach-ui',
        'react-bootstrap/react-bootstrap',
        'StreakYC/react-smooth-collapse',
        'react-spring/react-spring',
        'AriPerkkio/scrpr',
        'AriPerkkio/state-mgmt-examples',
        'AriPerkkio/suspense-examples',
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

    rulesUnderTesting: ['react/no-unstable-nested-components'],

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
        rules: {
            'react/no-unstable-nested-components': ['error'],
        },
    },
};
```

```sh
$ yarn add --dev eslint-remote-tester react
# Use local changes of rules under development
$ yarn link eslint-react-plugin
$ yarn lint:remote

Status (9/21)
[CLONING] ant-design/ant-design
[LINTING] mui-org/material-ui - 9895 files
[LINTING] withspectrum/spectrum - 1689 files
[LINTING] codesandbox/codesandbox-client - 1591 files
[CLONING] Automattic/wp-calypso

[DONE] AriPerkkio/js-framework-playground without errors
[DONE] oldboyxx/jira_clone without errors
[DONE] StreakYC/react-smooth-collapse without errors
[DONE] reach/reach-ui with 1 errors
[DONE] react-spring/react-spring without errors
[DONE] AriPerkkio/scrpr without errors
[DONE] AriPerkkio/suspense-examples without errors
[DONE] AriPerkkio/state-mgmt-examples without errors
[DONE] react-bootstrap/react-bootstrap without errors
```