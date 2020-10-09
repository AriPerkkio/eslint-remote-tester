import { Linter } from 'eslint';

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
}
