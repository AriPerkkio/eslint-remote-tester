import { Linter } from 'eslint';

/** Contents of the `eslint-remote-tester.config.js` */
export interface Config {
    repositories: string[];
    extensions: string[];
    pathIgnorePattern?: RegExp;
    rulesUnderTesting: string[];
    concurrentTasks?: number;
    eslintrc: Linter.Config;
    CI?: boolean;
}
