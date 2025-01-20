# eslint-remote-tester

[![version](https://img.shields.io/npm/v/eslint-remote-tester)](https://www.npmjs.com/package/eslint-remote-tester)

[Installation](#installation) | [Configuration](#configuration) | [How and when to use](#how-and-when-to-use) | [Github CI Actions](#github-ci-actions) | [Examples](#Examples)

`eslint-remote-tester` is a CLI tool for testing given [ESlint](https://github.com/eslint/eslint) rules against multiple repositories at once. It's designed to be used when validating regression of new rules. It can be used to spot whether a new rule flags false positives or crashes ESLint completely. CIs can be configured to verify regression of large set of rules so that possible null pointers or any unexpected errors are caught immediately.

<p align="center">
  <img width="640" src="https://raw.githubusercontent.com/AriPerkkio/eslint-remote-tester/HEAD/docs/demo.svg">
</p>

## Installation

```sh
# In your project directory
$ npm install --save-dev eslint-remote-tester

# eslint@>=9 is also required as peer dependency
$ npm install --save-dev eslint
```

The underlying git integration is done via [simple-git](https://github.com/steveukx/git-js). It requires git to be installed and [that it can be called using the command `git`.](https://github.com/steveukx/git-js#dependencies)

## Configuration

### Linking your local eslint plugin as a dependency

In order for `eslint-remote-tester`'s `eslint` to know where the definitions for the new rules or modified existing rules are, your local eslint plugin folder needs to be symlinked.
In your plugin folder, dependending on which package manager you use, run:

```sh
# Using npm package manager
npm link
npm link [your-plugin-name]
```

### package.json

Add new script to your `package.json` file.

```json
"scripts": {
    "lint:remote": "eslint-remote-tester",
```

### eslint-remote-tester.config.js

Create new configuration file `eslint-remote-tester.config.js` in the root of your project. This is used as configuration file by default. Use `-c` or `--config` argument for custom configuration file, e.g. `--config path/custom.config.js`.

```js
import js from '@eslint/js';

/** @type {import('eslint-remote-tester').Config} */
const config = {
    repositories: ['mui-org/material-ui', 'reach/reach-ui'],
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    eslintConfig: [js.configs.recommended],
    pathIgnorePattern: `(${[
        'node_modules',
        '\\/\\.', // Any file or directory starting with dot, e.g. ".git"
        'test-results',
        'docs',
    ].join('|')})`,
};

export default config;
```

Configuration file can also be written in TypeScript if [`jiti`](https://www.npmjs.com/package/jiti) or [`importx`](https://www.npmjs.com/package/importx) is installed. Use `--config` argument for TypeScript configuration file, e.g. `--config eslint-remote-tester.config.ts`.

```ts
import type { Config } from 'eslint-remote-tester';
import js from '@eslint/js';

const config: Config = {
    repositories: ['mui-org/material-ui', 'reach/reach-ui'],
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    eslintConfig: [js.configs.recommended],
};

export default config;
```

#### Configuration options

| Name                        | Description&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;                | Type                                                                                                | Required           | Default                                | Example                                                                                                                     |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- | :----------------- | :------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `repositories`              | Repositories to scan in format of `owner/project`. See [eslint-remote-tester-repositories] for shared list of repositories.                                                                                    | `string[]`                                                                                          | :white_check_mark: | :x:                                    | `['mui-org/material-ui', 'reach/reach-ui']`                                                                                 |
| `extensions`                | Extensions of files under scanning                                                                                                                                                                             | `string[]`                                                                                          | :white_check_mark: | :x:                                    | `['js', 'jsx', 'ts', 'tsx']`                                                                                                |
| `eslintConfig`              | ESLint configuration. Supports lazy initialization based on currently tested repository when a function is passed. Function is called with current repository and its location on filesystem.                  | `object \| ({ location, repository }) => object` See [Configuring ESLint]                           | :white_check_mark: | :x:                                    | `[js.configs.recommended]` `(options) => options.repository === 'my-repo' ? [js.configs.recommended] : []`                  |
| `pathIgnorePattern`         | Regexp pattern string used to exclude paths                                                                                                                                                                    | `string`                                                                                            | :x:                | :x:                                    | `(node_modules\|docs\|\\/\\.git)`                                                                                           |
| `maxFileSizeBytes`          | Max file size used to exclude bigger files                                                                                                                                                                     | `number`                                                                                            | :x:                | `2000000`                              | `1500000`                                                                                                                   |
| `rulesUnderTesting`         | Array of rules or a filter method used to filter out results. Use `undefined` or empty array when ESLint crashes are the only interest. Filter method is called with `ruleId` and `options`.                   | `string[] \| (ruleId, { repository }) => boolean`                                                   | :x:                | `[]`                                   | `['no-empty', 'react/sort-prop-types']` `(ruleId, options) => ruleId === 'no-undef' && options.repository === 'owner/repo'` |
| `resultParser`              | Syntax for the result parser                                                                                                                                                                                   | `plaintext\|markdown`                                                                               | :x:                | `markdown` on CLI. `plaintext` on CI   | `markdown`                                                                                                                  |
| `concurrentTasks`           | Maximum amount of tasks run concurrently                                                                                                                                                                       | `number`                                                                                            | :x:                | `5`                                    | `3`                                                                                                                         |
| `CI`                        | Flag used to set CI mode. `process.env.CI` is used when not set.                                                                                                                                               | `boolean`                                                                                           | :x:                | value of `process.env.CI === 'true'`   | `true`                                                                                                                      |
| `logLevel`                  | Filter log messages based on their priority                                                                                                                                                                    | `verbose\|info\|warn\|error`                                                                        | :x:                | `verbose`                              | `warn`                                                                                                                      |
| `slowLintTimeLimit`         | Time limit before linting of a single file is considered as slow, and logged as warning. Disabled by default.                                                                                                  | `number\|null`                                                                                      | :x:                | :x:                                    | `5 // 5 seconds`                                                                                                            |
| `cache`                     | Flag used to enable caching of cloned repositories. For CIs it's ideal to disable caching due to limited disk space.                                                                                           | `boolean`                                                                                           | :x:                | `true`                                 | `true`                                                                                                                      |
| `timeLimit`                 | Time limit before scan is interrupted and **exited successfully**. Ideal for avoiding CI timeouts in regression tests.                                                                                         | `number`                                                                                            | :x:                | `5.5 * 60 * 60, // 5 hours 30 minutes` | `5 * 60 * 60 // 5 hours`                                                                                                    |
| `compare`                   | Flag used to enable result comparison mode. Compares results of two scans and output the diff. Ideal for identifying new false positives when fixing existing rules. See [Fixing existing rules].              | `boolean`                                                                                           | :x:                | `false`                                | `true`                                                                                                                      |
| `updateComparisonReference` | Flag used to enable result comparison reference updating. Indicates whether comparison base should be updated after scan has finished. Ideal to be turned off once initial comparison base has been collected. | `boolean`                                                                                           | :x:                | `true`                                 | `true`                                                                                                                      |
| `onComplete`                | Callback invoked once scan is completed. Asynchronous functions are supported. Ideal for extending the process with custom features.                                                                           | `(results, comparisonResults, repositoryCount) => void`\|`Promise<void>`. See [onComplete example]. | :x:                | :x:                                    | `async (results, comparisonResults, repositoryCount) => {}`                                                                 |

[configuring eslint]: https://eslint.org/docs/user-guide/configuring
[fixing existing rules]: #fixing-existing-rules
[oncomplete example]: docs/onComplete-arguments.json
[eslint-remote-tester-repositories]: packages/repositories/README.md

### Execution

Run `npm run lint:remote`. Results are written into `./eslint-remote-tester-results` folder.

## How and when to use

_Disclaimer: This section is still work in progress._

### Developing new ESLint rules

When developing new ESLint rules you'll be most interested in results reported by the rule.
As the AST of Javascript and Typescript can cause very unexpected results it is not enough to test the rule only against unit tests and a small amount of repositories.
Testing the rule against 1000's of repositories can reveal unexpected results:

-   Does the rule report the intended patterns?
-   Does the rule falsely mark valid patterns as errors?
-   Are the error messages set as expected?

Follow these steps to test the new rule easily:

1. Include new rule in `rulesUnderTesting`
2. Configure `eslintConfig` with the new rule and its options
3. Run `eslint-remote-tester` locally
4. Check generated results at `./eslint-remote-tester-results`

### Fixing existing rules

Fixing existing rules without breaking old functionality or introducing new bugs can be difficult.
By testing the rule against 1000's of repositories and comparing these reports against previous build's reports it is easily seen whether anything broke.

Running `eslint-remote-tester` in comparison mode allows developers to see the exact changes in ESLint reports their code changes introduced.
Example of comparison results can be found at [Examples section](#examples).

Follow these steps to test code changes of existing rules easily:

1. Include given rule in `rulesUnderTesting`
2. Configure `eslintConfig` with the rule and its options
3. Stash code changes of the fix so that the current setup matches the latest build (typically `master` branch)
4. Enable `compare` in the configuration file. This will generate comparison reference results.
5. Run `eslint-remote-tester` locally
6. Apply code changes of the fix back
7. Disable `updateComparisonReference` in the configuration file. This will disable comparison reference updates - meaning that all next comparison runs are compared against the previously generated results (e.g. `master` branch).
8. Run `eslint-remote-tester` locally again
9. Check generated results at `./eslint-remote-tester-results/comparison-results`. New reports introduced by these code changes are saved in `added.md`. Reports not seen with latest changes are saved in `removed.md`.
10. Repeat steps 8-9 and keep fixing the rule until `added.md` does not contain new false positives and `removed.md` does not contain unintended reports.

### Plugin maintainer making sure new PRs don't introduce new false positives

Reviewing PRs of ESLint plugin projects can be slow if maintainers are expected to test every change manually.
Plugin projects can set their CI to run `eslint-remote-tester` on comparison mode for each new PR.
The CI will compare ESLint reports between the `master` and PR branches, and report all new and removed reports.
This way the reviewers can easily see whether PR actually fixed the issue and if it introduced new bugs.

Projects using GitHub CIs can utilize [eslint-remote-tester-compare-action](https://github.com/marketplace/actions/eslint-remote-tester-pr-comparator) for setting up PR comparisons.

### Plugin maintainer making sure all existing rules do not crash

Plugin projects can use `eslint-remote-tester` for smoke testing.
All the rules of given project can be run against 1000's of repositories so that only crashing rules are detected.
The job can even be configured to run for a limited time so that it will test as many repositories as it can in a specific time.
This can be done by setting `timeLimit` configuration. For Github CI the maximum time limit can be as long as 6 hours.

This project is set to run 6 hour long weekly scheduled tests using some of the most well-known ESLint community plugins.
Typically the fastest plugins can test more than **10K repositories** in the 6 hour time limit.

Projects using GitHub CIs can utilize [eslint-remote-tester-run-action](https://github.com/marketplace/actions/eslint-remote-tester-runner) for setting up smoke tests.

### Configuration maintainer making sure all repositories follow the rules

Configuration maintainers (`eslint-config-*)` can check all their repositories follow rules of the configuration.
By using an all-inclusive filter in `rulesUnderTesting` all ESLint reports are picked, e.g. `rulesUnderTesting: () => true`.

The arguments of filter callback can be used to exclude specific rules from specific repositories:

```js
rulesUnderTesting: function ruleFilter(ruleId, options) {
    if (ruleId === 'node/no-process-env' && options.repository === 'username/my-cli-package') {
        // my-cli-package is allowed to use process.env
        return false;
    }

    // All other rules & repositories
    return true;
}
```

## Github CI Actions

-   [eslint-remote-tester-run-action](https://github.com/marketplace/actions/eslint-remote-tester-runner)
-   [eslint-remote-tester-compare-action](https://github.com/marketplace/actions/eslint-remote-tester-pr-comparator)

## Examples

### Results:

-   [markdown](docs/results-markdown.md)
-   [plaintext](docs/results-plaintext)

### Comparison results:

-   [added](docs/comparison-results-added.md)
-   [removed](docs/comparison-results-removed.md)

### Configuration

-   [react configuration with +150 repositories](docs/eslint-remote-tester.react.config.js)
-   [small regression for eslint:recommended](eslint-remote-tester.config.js)

### Repositories

For easiest setup `eslint-remote-tester-repositories` npm package is provided.
See [documentation](repositories/README.md).

Target repositories can easily be found using [libraries.io](https://libraries.io/).
They provide [an API for querying repositories](https://libraries.io/api#project-dependent-repositories) which depend on certain project.
Example usage at [repository-query-script](repositories/scripts/fetch-libraries.js).
