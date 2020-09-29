# eslint-remote-tester

`eslint-remote-tester` is a CLI tool for testing given [ESlint](https://github.com/eslint/eslint) rules against multiple repositories at once. It's designed to be used when validating regression of new rules. It can be used to spot whether a new rule flags false positives or crashes ESLint completely.

<p align="center">
  <img width="640" src="https://raw.githubusercontent.com/AriPerkkio/eslint-remote-tester/HEAD/docs/demo.svg">
</p>

## Installation
```sh
# In your project directory
$ yarn add --dev eslint-remote-tester

# eslint is also required as peer dependency
$ yarn add --dev eslint
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

    /** Optional pattern used to exclude paths */
    pathIgnorePattern: "(node_modules|^\\.|test-results)",

    /** Rules used to filter out results. Use empty array when ESLint crashes are the only interest */
    rulesUnderTesting: [],

    /** Optional syntax for the result parser. Valid values are plaintext, markdown. Defaults to markdown on CLI, plaintext on CI */
    resultParser: 'markdown',

    /** Maximum amount of tasks ran concurrently */
    concurrentTasks: 5,

    /** ESLint configuration */
    eslintrc: {},

    /** Optional boolean flag used to set CI mode. Ignored when process.env.CI is set. */
    CI: false,
}
```

### Execution
Run `yarn lint:remote`. Results are written into `./results` folder.

## Example

### Results:

* [markdown](docs/results-markdown.md)
* [plaintext](docs/results-plaintext)

### Configuration

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

    pathIgnorePattern: "(node_modules|^\\.|test-results)",

    rulesUnderTesting: ['react/no-unstable-nested-components'],

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
            'react/no-unstable-nested-components': ['error'],
        },
    },
};
```
