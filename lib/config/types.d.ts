import { Linter } from 'eslint';

import { ResultTemplateOptions } from '@file-client/result-templates';

export type ResultParser = 'plaintext' | 'markdown';
export type LogLevel = 'verbose' | 'warn' | 'error';

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
