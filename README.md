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
Create new configuration file `eslint-remote-tester.config.js` in the root of your project. This is used as configuration file by default. Use `-c` or `--config` argument for custom configuration file, e.g. `--config path/custom.config.js`.
```js
module.exports = {
    /** Repositories to scan */
    repositories: [],

    /** Extensions of files under scanning */
    extensions: [],

    /** Optional pattern used to exclude paths */
    pathIgnorePattern: `(${[
        'node_modules',
        '\\/\\.', // Any file or directory starting with dot, e.g. ".git"
        'test-results',
        'docs',
    ].join('|')})`,

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
Run `yarn lint:remote`. Results are written into `./eslint-remote-tester-results` folder.

## Example

### Results:

* [markdown](docs/results-markdown.md)
* [plaintext](docs/results-plaintext)

### Configuration

- [react configuration with +150 repositories](eslint-remote-tester.react.config.js)
- [small regression for eslint:recommended](eslint-remote-tester.config.js)
