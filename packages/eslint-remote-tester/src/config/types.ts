import { Linter } from 'eslint';

import { ComparisonResults, Result } from '../file-client/result-templates.js';

type AllKeysOptional<T extends { [K: string]: any }> = {
    [K in keyof T]?: T[K];
};

export const ResultParsers = ['plaintext', 'markdown'] as const;
export type ResultParser = (typeof ResultParsers)[number];

export const LogLevels = ['verbose', 'info', 'warn', 'error'] as const;
export type LogLevel = (typeof LogLevels)[number];

/** Internal config typings after defaults have been set */
export interface Config {
    /** Repositories to scan in format of `owner/project` */
    repositories: string[];

    /** Extensions of files under scanning */
    extensions: string[];

    /** Regexp pattern string used to exclude paths */
    pathIgnorePattern?: RegExp;

    /** Max file size used to exclude bigger files */
    maxFileSizeBytes: number;

    /**
     * Array of rules or a filter method used to filter out results.
     * Use `undefined` or empty array when ESLint crashes are the only interest.
     */
    rulesUnderTesting:
        | string[]
        | ((ruleId: string, options: { repository: string }) => boolean);

    /** Syntax for the result parser */
    resultParser: ResultParser;

    /** Maximum amount of tasks run concurrently */
    concurrentTasks: number;

    /**
     * ESLint configuration.
     * Supports lazy initialization based on currently tested repository when a function is passed.
     * Function is called with current repository and its location on filesystem.
     */
    eslintConfig:
        | Linter.FlatConfig
        | ((options?: {
              repository: string;
              location: string;
          }) => Linter.FlatConfig | Promise<Linter.FlatConfig>);

    /** Flag used to set CI mode. `process.env.CI` is used when not set. */
    CI: boolean;

    /** Filter log messages based on their priority */
    logLevel: LogLevel;

    /**
     * Time limit before linting of a single file is considered as slow, and
     * logged as warning. Disabled by default.
     */
    slowLintTimeLimit: number | null;

    /**
     * Flag used to enable caching of cloned repositories.
     * For CIs it's ideal to disable caching due to limited disk space.
     */
    cache: boolean;

    /**
     * Time limit before scan is interrupted and **exited successfully**.
     * Ideal for avoiding CI timeouts in regression tests.
     */
    timeLimit: number;

    /**
     * Flag used to enable result comparison mode.
     * Compares results of two scans and output the diff.
     * Ideal for identifying new false positives when fixing existing rules.
     */
    compare: boolean;

    /**
     * Flag used to enable result comparison reference updating.
     * Indicates whether comparison base should be updated after scan has finished.
     * Ideal to be turned off once initial comparison base has been collected.
     */
    updateComparisonReference: boolean;

    /**
     * Callback invoked once scan is completed.
     * Asynchronous functions are supported.
     * Ideal for extending the process with custom features.
     */
    onComplete?: (
        results: Result[],
        comparisonResults: ComparisonResults | null,
        repositoryCount: number
    ) => Promise<void> | void;
}

type RequiredFields = Pick<
    Config,
    'repositories' | 'extensions' | 'eslintConfig'
>;
type OptionalFields = AllKeysOptional<
    Pick<
        Config,
        Exclude<keyof Config, keyof RequiredFields | 'pathIgnorePattern'>
    >
> &
    // Internally a RegExp, publicly string
    AllKeysOptional<{
        pathIgnorePattern: string | Config['pathIgnorePattern'];
    }>;

/** Config matching public API */
export type ConfigWithOptionals = RequiredFields & OptionalFields;

/** Config before validation */
export type ConfigToValidate = AllKeysOptional<ConfigWithOptionals>;
