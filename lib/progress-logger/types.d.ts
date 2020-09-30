import { Chalk } from 'chalk';

export interface Task {
    step?: 'START' | 'CLONE' | 'PULL' | 'READ' | 'LINT';
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
    characters: string;
    x: number;
    y: number;
    wholeRow?: boolean;
}
