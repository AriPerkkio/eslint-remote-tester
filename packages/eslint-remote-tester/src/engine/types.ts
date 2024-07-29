import type { ESLint, Linter } from 'eslint';

export interface LintMessage extends Linter.LintMessage {
    path: string;
    source?: ESLint.LintResult['source'];
    error?: string;
}

export interface WorkerData {
    repository: string;
    configurationLocation?: string;
}
