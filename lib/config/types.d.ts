import { Linter } from 'eslint';

import { ResultTemplateOptions } from '@file-client/result-templates';

export type ResultParser = 'plaintext' | 'markdown';

/** Contents of the `eslint-remote-tester.config.js` */
export interface Config {
    repositories: string[];
    extensions: string[];
    pathIgnorePattern?: RegExp;
    rulesUnderTesting: string[];
    resultParser: ResultParser;
    concurrentTasks: number;
    eslintrc: Linter.Config;
    CI: boolean;
    cache: boolean;
    onComplete?: (results: ResultTemplateOptions[]) => Promise<void> | void;
}
