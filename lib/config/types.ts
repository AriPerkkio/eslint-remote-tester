import { Linter } from 'eslint';

import { ComparisonResults, Result } from '@file-client/result-templates';

type AllKeysOptional<T extends { [K: string]: any }> = {
    [K in keyof T]?: T[K];
};

export const ResultParsers = ['plaintext', 'markdown'] as const;
export type ResultParser = typeof ResultParsers[number];

export const LogLevels = ['verbose', 'info', 'warn', 'error'] as const;
export type LogLevel = typeof LogLevels[number];

/** Internal config typings after defaults have been set */
export interface Config {
    repositories: string[];
    extensions: string[];
    pathIgnorePattern?: RegExp;
    maxFileSizeBytes: number;
    rulesUnderTesting:
        | string[]
        | ((ruleId: string, options: { repository: string }) => boolean);
    resultParser: ResultParser;
    concurrentTasks: number;
    eslintrc: Linter.Config;
    CI: boolean;
    logLevel: LogLevel;
    cache: boolean;
    timeLimit: number;
    compare: boolean;
    updateComparisonReference: boolean;
    onComplete?: (
        results: Result[],
        comparisonResults: ComparisonResults | null,
        repositoryCount: number
    ) => Promise<void> | void;
}

type RequiredFields = Pick<Config, 'repositories' | 'extensions' | 'eslintrc'>;
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
