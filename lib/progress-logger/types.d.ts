import { ForegroundColor } from 'chalk';

import { LogLevel } from '@config/types';

export interface Task {
    step?: 'START' | 'CLONE' | 'PULL' | 'READ' | 'LINT';
    color?: typeof ForegroundColor;
    repository: string;
    fileCount?: number;
    currentFileIndex?: number;
    warnings?: string[];
}

export interface LogMessage {
    content: string;
    color?: typeof ForegroundColor;
    level: LogLevel;
}

// prettier-ignore
export type Listener<Key = ListenerType> =
    Key extends 'message' ? (message: LogMessage) => void :
    Key extends 'task' ? (task: Task, done?: boolean) => void :
    Key extends 'exit' ? () => void :
    Key extends 'ciKeepAlive' ? (message: string) => void :
    Key extends 'timeout' ? () => void :
    never;

export interface Listeners {
    exit: Listener<'exit'>[];
    message: Listener<'message'>[];
    task: Listener<'task'>[];
    ciKeepAlive: Listener<'ciKeepAlive'>[];
    timeout: Listener<'timeout'>[];
}

export type ListenerType = keyof Listeners;
