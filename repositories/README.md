# eslint-remote-tester-repositories

> Shared repositories for eslint-remote-tester.config.js

Utilities for making it easier to configure repositories for `eslint-remote-tester.config.js`.
Provides over 10K GitHub hosted repositories.

[![version](https://img.shields.io/npm/v/eslint-remote-tester-repositories)](https://www.npmjs.com/package/eslint-remote-tester-repositories)

## Installation

```sh
# In your project directory
$ yarn add --dev eslint-remote-tester-repositories
```

## API

### getRepositories

Get list of repositories as `string[]`.

#### Options

-   `randomize`: `boolean` | Whether to randomize order of repositories. Defaults to `false`.

#### Example

```js
// eslint-remote-tester.config.js
const { getRepositories } = require('eslint-remote-tester-repositories');

module.exports = {
    repositories: getRepositories({ randomize: true }),
    ...
};
```

### getPathIgnorePattern

Get `Regexp` for `pathIgnorePattern` matching provided repositories.

#### Example

```js
// eslint-remote-tester.config.js
const { getPathIgnorePattern } = require('eslint-remote-tester-repositories');

module.exports = {
    pathIgnorePattern: getPathIgnorePattern(),
    ...
};
```
