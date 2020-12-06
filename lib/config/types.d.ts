import { Linter } from 'eslint';

import { ResultTemplateOptions } from '@file-client/result-templates';

export const ResultParsers: ['plaintext', 'markdown'];
export type ResultParser = typeof ResultParsers[number];

export const LogLevels: ['verbose', 'info', 'warn', 'error'];
export type LogLevel = typeof LogLevels[number];

/** Contents of the `eslint-remote-tester.config.js` */
export interface Config {
    repositories: string[];
    extensions: string[];
    pathIgnorePattern?: RegExp;
    maxFileSizeBytes: number;
    rulesUnderTesting: string[];
    resultParser: ResultParser;
    concurrentTasks: number;
    eslintrc: Linter.Config;
    CI: boolean;
    logLevel: LogLevel;
    cache: boolean;
    onComplete?: (results: ResultTemplateOptions[]) => Promise<void> | void;
}

type AllKeysOptional<T extends { [K: string]: any }> = {
    [K in keyof T]?: T[K];
};

/** Config before validation */
export type ConfigToValidate = AllKeysOptional<Config>;
