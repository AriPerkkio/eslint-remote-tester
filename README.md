# eslint-remote-tester

[![eslint-config-airbnb](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-config-airbnb/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-config-airbnb)
[![eslint-plugin-cypress](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-cypress/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-cypress)
[![eslint-plugin-import](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-import/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-import)
[![eslint-plugin-jest](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-jest/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-jest)
[![eslint-plugin-jest-dom](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-jest-dom/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-jest-dom)
[![eslint-plugin-jsx-a11y](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-jsx-a11y/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-jsx-a11y)
[![eslint-plugin-mocha](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-mocha/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-mocha)
[![eslint-plugin-node](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-node/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-node)
[![eslint-plugin-react](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-react/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-react)
[![eslint-plugin-react-hooks](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-react-hooks/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-react-hooks)
[![eslint-plugin-react-redux](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-react-redux/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-react-redux)
[![eslint-plugin-sonarjs](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-sonarjs/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-sonarjs)
[![eslint-plugin-testing-library](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-testing-library/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-testing-library)
[![eslint-plugin-unicorn](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-plugin-unicorn/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-plugin-unicorn)
[![typescript-eslint-eslint-plugin](https://github.com/AriPerkkio/eslint-remote-tester/workflows/typescript-eslint-eslint-plugin/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Atypescript-eslint-eslint-plugin)
[![eslint-core](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-core/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-core)
[![eslint-core-ts](https://github.com/AriPerkkio/eslint-remote-tester/workflows/eslint-core-ts/badge.svg)](https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3Aeslint-core-ts)

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
    repositories: ['mui-org/material-ui', 'reach/reach-ui'],
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    eslintrc: {
        root: true,
        extends: ['eslint:recommended'],
    },
    pathIgnorePattern: `(${[
        'node_modules',
        '\\/\\.', // Any file or directory starting with dot, e.g. ".git"
        'test-results',
        'docs',
    ].join('|')})`,
};
```

#### Configuration options

| Name                        | Description&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;                | Type                                                                               | Required           | Default                                | Example                                     |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :----------------- | :------------------------------------- | :------------------------------------------ |
| `repositories`              | Repositories to scan in format of `owner/project`                                                                                                                                                              | `string[]`                                                                         | :white_check_mark: | :x:                                    | `['mui-org/material-ui', 'reach/reach-ui']` |
| `extensions`                | Extensions of files under scanning                                                                                                                                                                             | `string[]`                                                                         | :white_check_mark: | :x:                                    | `['js', 'jsx', 'ts', 'tsx']`                |
| `eslintrc`                  | ESLint configuration                                                                                                                                                                                           | See [Configuring ESLint]                                                           | :white_check_mark: | :x:                                    | `{ root: true, extends: ['eslint:all'] }`   |
| `pathIgnorePattern`         | Regexp pattern string used to exclude paths                                                                                                                                                                    | `string`                                                                           | :x:                | :x:                                    | `(node_modules\|docs\|\\/\\.git)`           |
| `maxFileSizeBytes`          | Max file size used to exclude bigger files                                                                                                                                                                     | `number`                                                                           | :x:                | `2000000`                              | `1500000`                                   |
| `rulesUnderTesting`         | Array of rules used to filter out results. Use `undefined` or empty array when ESLint crashes are the only interest.                                                                                           | `string[]`                                                                         | :x:                | `[]`                                   | `['no-empty', 'react/sort-prop-types']`     |
| `resultParser`              | Syntax for the result parser                                                                                                                                                                                   | `plaintext\|markdown`                                                              | :x:                | `markdown` on CLI. `plaintext` on CI   | `markdown`                                  |
| `concurrentTasks`           | Maximum amount of tasks run concurrently                                                                                                                                                                       | `number`                                                                           | :x:                | `5`                                    | `3`                                         |
| `CI`                        | Flag used to set CI mode. `process.env.CI` is used when not set.                                                                                                                                               | `boolean`                                                                          | :x:                | value of `process.env.CI === 'true'`   | `true`                                      |
| `logLevel`                  | Filter log messages based on their priority                                                                                                                                                                    | `verbose\|info\|warn\|error`                                                       | :x:                | `verbose`                              | `warn`                                      |
| `cache`                     | Flag used to enable caching of cloned repositories. For CIs it's ideal to disable caching due to limited disk space.                                                                                           | `boolean`                                                                          | :x:                | `true`                                 | `true`                                      |
| `timeLimit`                 | Time limit before scan is interrupted and **exited successfully**. Ideal for avoiding CI timeouts in regression tests.                                                                                         | `number`                                                                           | :x:                | `5.5 * 60 * 60, // 5 hours 30 minutes` | `5 * 60 * 60 // 5 hours`                    |
| `compare`                   | Flag used to enable result comparison mode. Compares results of two scans and output the diff. Ideal for identifying new false positives when fixing existing rules.                                           | `boolean`                                                                          | :x:                | `false`                                | `true`                                      |
| `updateComparisonReference` | Flag used to enable result comparison reference updating. Indicates whether comparison base should be updated after scan has finished. Ideal to be turned off once initial comparison base has been collected. | `boolean`                                                                          | :x:                | `true`                                 | `true`                                      |
| `onComplete`                | Callback invoked once scan is completed. Asynchronous functions are supported. Ideal for extending the process with custom features.                                                                           | `(results, comparisonResults) => void`\|`Promise<void>`. See [onComplete example]. | :x:                | :x:                                    | `async (results, comparisonResults) => {}`  |

[configuring eslint]: https://eslint.org/docs/user-guide/configuring
[oncomplete example]: docs/onComplete-arguments.json

### Execution

Run `yarn lint:remote`. Results are written into `./eslint-remote-tester-results` folder.

## Example

### Results:

-   [markdown](docs/results-markdown.md)
-   [plaintext](docs/results-plaintext)

### Configuration

-   [react configuration with +150 repositories](eslint-remote-tester.react.config.js)
-   [small regression for eslint:recommended](eslint-remote-tester.config.js)

### Repositories

Target repositories can easily be found using [libraries.io](https://libraries.io/). They provide [an API for querying repositories](https://libraries.io/api#project-dependent-repositories) which depend on certain project. Example usage at [repository-query-script](configs/repository-query-script/fetch-libraries.js).
