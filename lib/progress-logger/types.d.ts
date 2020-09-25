import { Chalk } from 'chalk';

export interface Task {
    step?: 'CLONE' | 'READ' | 'LINT';
    color?: Chalk;
    repository: string;
    fileCount?: number;
    currentFileIndex?: number;
    warnings?: string[];
}

export interface LogMessage {
    content: string;
    color?: Chalk;
}

export interface LogUpdate {
    character: string;
    x: number;
    y: number;
}
