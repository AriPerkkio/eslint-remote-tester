import { Linter } from 'eslint';

export interface LintMessage extends Linter.LintMessage {
    path: string;
}

export interface WorkerData {
    repository: string;
    configurationLocation?: string;
}
