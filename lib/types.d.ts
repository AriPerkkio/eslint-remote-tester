import { Linter } from 'eslint';

export interface LintMessage extends Linter.LintMessage {
    path: string;
}

export interface SourceFile {
    content: string;
    path: string;
}

export type WorkerMessage =
    | { type: 'READ' }
    | { type: 'CLONE' }
    | { type: 'LINT_START'; payload: number }
    | { type: 'LINT_START'; payload: number }
    | { type: 'LINT_END'; payload: LintMessage[] }
    | { type: 'FILE_LINT_END'; payload: number };
