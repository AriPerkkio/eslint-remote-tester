import config from '../config';
import { Task } from './types';

export const TASK_TEMPLATE = (task: Task): string => {
    switch (task.step) {
        case 'CLONE':
            return `[CLONING] ${task.repository}`;

        case 'READ':
            return `[READING] ${task.repository}`;

        case 'LINT':
            return (
                `[LINTING] ${task.repository} - ` +
                `${task.currentFileIndex}/${task.fileCount} files`
            );

        default:
            return `Unknown step ${task.step}`;
    }
};
export const REPOSITORIES_STATUS_TEMPLATE = (
    scannedRepositories: number
): string =>
    `Repositories (${scannedRepositories}/${config.repositories.length})`;

export const LINT_FAILURE_TEMPLATE = (
    repository: string,
    rule?: string
): string => `[WARN] ${repository} crashed${rule ? `: ${rule}` : ''}`;

export const CLONE_FAILURE_TEMPLATE = (repository: string): string =>
    `[WARN] ${repository} failed to clone`;

export const READ_FAILURE_TEMPLATE = (repository: string): string =>
    `[WARN] ${repository} failed to read files`;

export const WRITE_FAILURE_TEMPLATE = (repository: string): string =>
    `[WARN] ${repository} failed to write results`;
