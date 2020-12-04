# eslint-remote-tester

`eslint-remote-tester` is a CLI tool for testing given [ESlint](https://github.com/eslint/eslint) rules against multiple repositories at once. It's designed to be used when validating regression of new rules. It can be used to spot whether a new rule flags false positives or crashes ESLint completely. CIs can be configured to verify regression of large set of rules so that possible null pointers or any unexpected errors are caught immediately.

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

The underlying git integration is done via [simple-git](https://github.com/steveukx/git-js). It requires git to be installed and [that it can be called using the command `git`.](https://github.com/steveukx/git-js#dependencies)

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

    /** Optional max file size used to exclude bigger files. Defaults to 2 megabytes. */
    maxFileSizeBytes: 2000000,

    /** Rules used to filter out results. Use empty array when ESLint crashes are the only interest */
    rulesUnderTesting: [],

    /** Optional syntax for the result parser. Valid values are plaintext, markdown. Defaults to markdown on CLI, plaintext on CI */
    resultParser: 'markdown',

    /** Maximum amount of tasks ran concurrently */
    concurrentTasks: 5,

    /** ESLint configuration */
    eslintrc: {},

    /** Optional boolean flag used to set CI mode. process.env.CI is used when not set. */
    CI: false,

    /** Optional setting for log level. Valid values are verbose, warn, error. Defaults to verbose. */
    logLevel: 'verbose',

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
        // Extend the process with custom features, e.g. send results to email, create issues to Github...
    },
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

### Repositories

Target repositories can easily be found using [libraries.io](https://libraries.io/). They provide [an API for querying repositories](https://libraries.io/api#project-dependent-repositories) which depend on certain project.
