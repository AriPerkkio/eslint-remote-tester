## [2.0.1](https://github.com/AriPerkkio/eslint-remote-tester/compare/v2.0.0...v2.0.1) (2021-10-31)

### Bug Fixes

-   **deps:** match react version requirement with ink ([#302](https://github.com/AriPerkkio/eslint-remote-tester/issues/302)) ([21824eb](https://github.com/AriPerkkio/eslint-remote-tester/commit/21824ebc84d00f0e7db8499b6ef3358584a53a8b))

# [2.0.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v1.3.1...v2.0.0) (2021-10-23)

-   feat!: improve `ruleId` parsing ([69a14c6](https://github.com/AriPerkkio/eslint-remote-tester/commit/69a14c61cceba7d0ae8121b71cd41d168dba933b))

### BREAKING CHANGES

-   Reported rules now may include plugin name,
    e.g. `no-unstable-components` -> `react/no-unstable-components`
    These are used in reported results and in some callbacks of eslint-remote-tester.config.js.

*   parse `ruleId` from stack traces provided by ESLint v8

## [1.3.1](https://github.com/AriPerkkio/eslint-remote-tester/compare/v1.3.0...v1.3.1) (2021-09-11)

### Bug Fixes

-   **node-16:** avoid deprecation warnings of `fs.rmdirSync` ([#277](https://github.com/AriPerkkio/eslint-remote-tester/issues/277)) ([3a84361](https://github.com/AriPerkkio/eslint-remote-tester/commit/3a8436130e5cc5bef23d7bce22000644a7886dcc))

# [1.3.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v1.2.0...v1.3.0) (2021-07-10)

### Bug Fixes

-   pass main thread's environment variables to worker threads ([bd294f5](https://github.com/AriPerkkio/eslint-remote-tester/commit/bd294f581c615e60f9bc195e8affd1d3829fc775))

### Features

-   compile to target the actual feature set of Node >=12 ([#173](https://github.com/AriPerkkio/eslint-remote-tester/issues/173)) ([65ec3d8](https://github.com/AriPerkkio/eslint-remote-tester/commit/65ec3d89ccc511cd0f9528d2b007b4ca8a07c1ea))
-   support `config.eslintrc` as function ([6079cab](https://github.com/AriPerkkio/eslint-remote-tester/commit/6079cabae8d5ca2207edf4a6c30c07b7ee414653))

# [1.2.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v1.1.0...v1.2.0) (2021-05-15)

### Bug Fixes

-   **compare:** do not "git pull" when in comparison mode ([e3cbc0f](https://github.com/AriPerkkio/eslint-remote-tester/commit/e3cbc0f9b21e82bd08fc378e3504651347a81faa))
-   **engine:** ignore eslint inline configurations ([93616dd](https://github.com/AriPerkkio/eslint-remote-tester/commit/93616dde4e95c6c98ec832adbae879e12761f3c1)), closes [#38](https://github.com/AriPerkkio/eslint-remote-tester/issues/38)
-   **engine:** report worker crashes correctly ([#43](https://github.com/AriPerkkio/eslint-remote-tester/issues/43)) ([82cb301](https://github.com/AriPerkkio/eslint-remote-tester/commit/82cb30127a79b23d961b6896851c380405eaabd0))
-   **results:** limit rows of results into 1000 characters ([#101](https://github.com/AriPerkkio/eslint-remote-tester/issues/101)) ([14c170e](https://github.com/AriPerkkio/eslint-remote-tester/commit/14c170e6588c31746b2caab1bcfba4f995e770c4))

### Features

-   move cache under `node_modules` ([83cb6e5](https://github.com/AriPerkkio/eslint-remote-tester/commit/83cb6e51d73fc7aa1153a409a255310c3954e148))
-   **ci:** include count of errors in ci status messages ([#126](https://github.com/AriPerkkio/eslint-remote-tester/issues/126)) ([d34660f](https://github.com/AriPerkkio/eslint-remote-tester/commit/d34660fd28de475628bf261eebd107c2f317712b))
-   **cli:** log status of cached repositories ([dc5580c](https://github.com/AriPerkkio/eslint-remote-tester/commit/dc5580ca9df5437cbf31ed456eac557bde210925))
-   pass count of scanned repositories to `config.onComplete` ([#102](https://github.com/AriPerkkio/eslint-remote-tester/issues/102)) ([814f6f0](https://github.com/AriPerkkio/eslint-remote-tester/commit/814f6f04c4129aea8841a0c5ba448550e5629823))

# [1.1.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v1.0.1...v1.1.0) (2021-02-10)

### Features

-   enable checking all rules ([9d1a299](https://github.com/AriPerkkio/eslint-remote-tester/commit/9d1a299fe24e9c9d51bd17bc58a8088607f78b1c))

## [1.0.1](https://github.com/AriPerkkio/eslint-remote-tester/compare/v1.0.0...v1.0.1) (2021-02-08)

### Bug Fixes

-   handle results as streams ([562538e](https://github.com/AriPerkkio/eslint-remote-tester/commit/562538ed5d4587a52533beca2396a61efc6c98f3))
-   **engine:** support large amount of JSONs ([668adb2](https://github.com/AriPerkkio/eslint-remote-tester/commit/668adb27d965e723f5a990726d560433260cc008))
-   include error message in write failure logs ([84100b7](https://github.com/AriPerkkio/eslint-remote-tester/commit/84100b700aa83b6a6a21bd50c0a77a90daf4ddd8))

### Performance Improvements

-   **result-comparator:** add internal hash for comparing results via map ([44daa5d](https://github.com/AriPerkkio/eslint-remote-tester/commit/44daa5daa6af60adebffa1ab64369b0cba7b39dd))

# [1.0.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.6.0...v1.0.0) (2021-02-01)

### Bug Fixes

-   auto-generated config contains incorrectly escaped regex ([ea52f15](https://github.com/AriPerkkio/eslint-remote-tester/commit/ea52f1539aadcf220dae55245b08ce8eb8523d9e))

### Features

-   use @babel/code-frame for result.source ([e28c06d](https://github.com/AriPerkkio/eslint-remote-tester/commit/e28c06def6439cb42dd7234be5a20e9ecedca3a9))

### BREAKING CHANGES

-   output and onComplete args result.source is now formatted with @babel/code-frame

# [0.6.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.5.0...v0.6.0) (2021-01-28)

### Bug Fixes

-   exclude unnecessary sourcemaps from builds ([9822364](https://github.com/AriPerkkio/eslint-remote-tester/commit/98223646f8e865211d18c79336da9f5350499ae1))

### Features

-   add private api for eslint-remote-tester-compare-action ([52c790b](https://github.com/AriPerkkio/eslint-remote-tester/commit/52c790b9320d43bcf5a1df589cac68bb0f4722a5))

# [0.5.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.4.0...v0.5.0) (2021-01-16)

### Bug Fixes

-   **results:** prevent unnecessary text wrap on ci ([a836913](https://github.com/AriPerkkio/eslint-remote-tester/commit/a836913cbdc0eca22fc89c205727a92bc5dd7e8b))
-   small error ([318d512](https://github.com/AriPerkkio/eslint-remote-tester/commit/318d512d67ee05b471f913ade499ce01c3ee8edd))
-   **results:** markdown template formatting ([c0f62fb](https://github.com/AriPerkkio/eslint-remote-tester/commit/c0f62fb0a062df9623470b8f0ae0b48e8aea5593))
-   **validator:** resolve result parser properly ([a4af9bb](https://github.com/AriPerkkio/eslint-remote-tester/commit/a4af9bbc8aa042c9e06cd713e70090dcba3f6bb7))

### Features

-   **config:** adds compare option ([acb97c5](https://github.com/AriPerkkio/eslint-remote-tester/commit/acb97c5a2160511db2d0d0b7c16bdaab90041a3a))
-   **config:** adds updateComparisonReference option ([d544578](https://github.com/AriPerkkio/eslint-remote-tester/commit/d544578a5b90811bac491ab72be00ac33f943085))
-   **file-client:** initialize compaison results directory ([19f6136](https://github.com/AriPerkkio/eslint-remote-tester/commit/19f61369d874ab1efbb0db0cc7b6598e30a3944c))
-   **result-comparator:** generate comparison results ([d8af9c8](https://github.com/AriPerkkio/eslint-remote-tester/commit/d8af9c88e6756fad78ab55896f9275bc002316cf))
-   **result-comparator:** include comparison results in config.onComplete ([378a2b3](https://github.com/AriPerkkio/eslint-remote-tester/commit/378a2b306eab94352b29e17cc83a7a30ab129d89))
-   **result-comparator:** render comparison results on ui ([e36d4c9](https://github.com/AriPerkkio/eslint-remote-tester/commit/e36d4c90711e8613788d8285db5fdc97ec57da2b))
-   **result-comparator:** update comparison reference based on config.updateComparisonReference ([f5d9b04](https://github.com/AriPerkkio/eslint-remote-tester/commit/f5d9b042a5fdfeca476419b14468563df2e6862f))
-   **validator:** improve configuration validation ([09c23ce](https://github.com/AriPerkkio/eslint-remote-tester/commit/09c23ce40e2e0d50fc3d6bbac47d76c7f87a119f))

# [0.4.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.3.5...v0.4.0) (2020-12-17)

### Bug Fixes

-   **engine:** pass process.env.CI to workers ([74c7831](https://github.com/AriPerkkio/eslint-remote-tester/commit/74c78311029d05bf1bbf14bc760e90620667083d))
-   **file-client:** handle symlinks ([5c4144f](https://github.com/AriPerkkio/eslint-remote-tester/commit/5c4144f6c8b74a7c42d2c0afb572fd97b43fd0c3))

### Features

-   **config:** adds timeLimit ([5cb133d](https://github.com/AriPerkkio/eslint-remote-tester/commit/5cb133dbebb33cdf44a6284d9d407a1b21745654))
-   **config:** validate duplicate repositories ([485fd53](https://github.com/AriPerkkio/eslint-remote-tester/commit/485fd53faf52f84fba908815f69dce185f78c1a6))
-   **config:** validate unknown options ([5c2cc53](https://github.com/AriPerkkio/eslint-remote-tester/commit/5c2cc53e94be18b72678e6858452ff43bfae6c7b))

## [0.3.5](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.3.4...v0.3.5) (2020-12-06)

### Bug Fixes

-   **progress-logger:** add `info` logLevel for ci-keep-alive messages ([ecacd30](https://github.com/AriPerkkio/eslint-remote-tester/commit/ecacd307c148ca006a6666314d160b4a69ac9e66))

## [0.3.4](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.3.3...v0.3.4) (2020-12-05)

### Bug Fixes

-   **config:** include eslintrc.rules to validation ([556a09f](https://github.com/AriPerkkio/eslint-remote-tester/commit/556a09f30b598a5a14658d253c1f29e884d86a7f))
-   **repository-client:** prevent process hang caused by git prompt ([ebdd8c6](https://github.com/AriPerkkio/eslint-remote-tester/commit/ebdd8c68b000259daf1fd43bee1068d196ab8495))

### Features

-   **config:** adds logLevel ([f538ff7](https://github.com/AriPerkkio/eslint-remote-tester/commit/f538ff79913e6f1c04f2e931ce09720b86c91aee))
-   **log-level:** decrease log level of multiple warnings ([f83ca73](https://github.com/AriPerkkio/eslint-remote-tester/commit/f83ca737ba2d6e23971e6d28fbe56e910dd8577f))

### Performance Improvements

-   **repository-client:** clone only a single branch without history ([07ac720](https://github.com/AriPerkkio/eslint-remote-tester/commit/07ac720accd39f30a79821303567d23eb8b6108e))

## [0.3.3](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.3.2...v0.3.3) (2020-11-29)

### Features

-   **config:** add maxFileSizeBytes option ([364f26d](https://github.com/AriPerkkio/eslint-remote-tester/commit/364f26df69e6a37ba2f13ecdcecf6a406fc60be9))

## [0.3.2](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.3.1...v0.3.2) (2020-11-28)

### Bug Fixes

-   **config:** exit with error code when config is invalid ([f4f3ab6](https://github.com/AriPerkkio/eslint-remote-tester/commit/f4f3ab684227c63fb118396c9aa07c4238a4c6ff))
-   **results:** exit with status code when lint contains errors ([a6c7c51](https://github.com/AriPerkkio/eslint-remote-tester/commit/a6c7c517523f0f4e91c9c3fe61b34aeae6229c7c))

### Features

-   **ci:** ci-keep-alive message ([35c79c6](https://github.com/AriPerkkio/eslint-remote-tester/commit/35c79c6ae8b56ac0983b1fed8373233fc8a06172))
-   **ci:** github actions ([926c717](https://github.com/AriPerkkio/eslint-remote-tester/commit/926c7171260afb22b5b3f60dad8f9e9889e48b1c))
-   **ci-runner:** add separate ci-runner package ([525ab3e](https://github.com/AriPerkkio/eslint-remote-tester/commit/525ab3ea5f93863bb7c5391d52fdf36daa7d7744))
-   **ci-runner:** run ci on schedule ([a51bebe](https://github.com/AriPerkkio/eslint-remote-tester/commit/a51bebec8a37f135043ae1e063760ff9c8299592))
-   **config:** add cache flag ([5d8d21d](https://github.com/AriPerkkio/eslint-remote-tester/commit/5d8d21dd1a6b0e0a51e86504495bdfb6ecea3379))
-   **config:** add onComplete hook ([d053d2f](https://github.com/AriPerkkio/eslint-remote-tester/commit/d053d2f9e9999f4fb7861c36372095923687be61))

## [0.3.1](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.3.0...v0.3.1) (2020-11-08)

### Bug Fixes

-   **linter-crash:** add missing file count increase on crashes ([74e75de](https://github.com/AriPerkkio/eslint-remote-tester/commit/74e75de806a9fa3664250f401cdac10c5f5d65b5))
-   **linter-crash:** prevent displaying `Rule: null` when unable to parse ruleId ([10c4ac9](https://github.com/AriPerkkio/eslint-remote-tester/commit/10c4ac9f5247c2d4bc65d3058c70096afc918e76))
-   **results:** source window size resolving ([caa6236](https://github.com/AriPerkkio/eslint-remote-tester/commit/caa623651de2e9fe74e1650bff2c00d19d8bcc15))

### Features

-   **cli:** handle non-tty streams ([b08c2e6](https://github.com/AriPerkkio/eslint-remote-tester/commit/b08c2e64ffc1d31acbb35701dc383d624a0b3eaf))
-   **results:** include erroneous line and source to linter crashes ([2737019](https://github.com/AriPerkkio/eslint-remote-tester/commit/2737019b38bf42588a6d6a4f9fa5f97044e9e5ea))

# [0.3.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.2.1...v0.3.0) (2020-11-05)

### Features

-   **cli:** ink CLI support ([a7c2253](https://github.com/AriPerkkio/eslint-remote-tester/commit/a7c22534f50274949939023b6459ebcb258ad51a))
-   **config:** config.CI to override env.CI ([377a869](https://github.com/AriPerkkio/eslint-remote-tester/commit/377a869d286a77f7dd7023edb963abc8b9b2d401))
-   **results:** include repository owner in results filenames ([21e45a3](https://github.com/AriPerkkio/eslint-remote-tester/commit/21e45a3033952614fd9fd9b2182bf6b06d43c44e))
-   **tests:** integration tests update and split ([0c6135c](https://github.com/AriPerkkio/eslint-remote-tester/commit/0c6135cec5df648d9edf6a4d6c454eda44bb82be))

### BREAKING CHANGES

-   **config:** Prioritize config over environment variables when resolving value for CI

## [0.2.1](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.2.0...v0.2.1) (2020-10-17)

# [0.2.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.1.3...v0.2.0) (2020-10-11)

## [0.1.3](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.1.2...v0.1.3) (2020-10-07)

## [0.1.2](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.1.1...v0.1.2) (2020-10-01)

## [0.1.1](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.1.0...v0.1.1) (2020-09-25)

# [0.1.0](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.0.4...v0.1.0) (2020-09-25)

## [0.0.4](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.0.3...v0.0.4) (2020-09-18)

## [0.0.3](https://github.com/AriPerkkio/eslint-remote-tester/compare/v0.0.2...v0.0.3) (2020-09-17)

## 0.0.2 (2020-09-13)
