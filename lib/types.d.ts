import { Linter } from 'eslint';

export interface LintMessage extends Linter.LintMessage {
    path: string;
}

export interface SourceFile {
    content: string;
    path: string;
}
