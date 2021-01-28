import { Linter } from 'eslint';

export interface LintMessage extends Linter.LintMessage {
    path: string;
    error?: string;
}

export interface WorkerData {
    repository: string;
    configurationLocation?: string;
}
