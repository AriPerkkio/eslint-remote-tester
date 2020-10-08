import config from '../config';
import { Task } from './types';

export const TASK_TEMPLATE = (task: Task): string => {
    switch (task.step) {
        case 'START':
            return `[STARTING] ${task.repository}`;

        case 'CLONE':
            return `[CLONING] ${task.repository}`;

        case 'PULL':
            return `[PULLING] ${task.repository}`;

        case 'READ':
            return `[READING] ${task.repository}`;

        case 'LINT': {
            const status =
                task.currentFileIndex === 0 ? '' : `${task.currentFileIndex}/`;

            return `[LINTING] ${task.repository} - ${status}${task.fileCount} files`;
        }

        default:
            return `Unknown step ${task.step}`;
    }
};

export const REPOSITORIES_STATUS_TEMPLATE = (
    scannedRepositories: number
): string =>
    `Repositories (${scannedRepositories}/${config.repositories.length})`;

export const CI_STATUS_TEMPLATE = (scannedRepositories: number): string =>
    `[INFO] ${REPOSITORIES_STATUS_TEMPLATE(scannedRepositories)}`;

export const LINT_END_TEMPLATE = (
    repository: string,
    errorCount: number
): string => `[DONE] ${repository} ${errorCount} errors`;

export const LINT_FAILURE_TEMPLATE = (
    repository: string,
    rule?: string
): string => `[WARN] ${repository} crashed${rule ? `: ${rule}` : ''}`;

export const WORKER_FAILURE_TEMPLATE = (
    repository: string,
    errorCode?: string
): string =>
    `[WARN] Worker crashed on ${repository}${
        errorCode ? ` (${errorCode})` : ''
    }`;

export const PULL_FAILURE_TEMPLATE = (repository: string): string =>
    `[WARN] ${repository} failed to pull`;

export const CLONE_FAILURE_TEMPLATE = (repository: string): string =>
    `[WARN] ${repository} failed to clone`;

export const READ_FAILURE_TEMPLATE = (repository: string): string =>
    `[WARN] ${repository} failed to read files`;

export const WRITE_FAILURE_TEMPLATE = (repository: string): string =>
    `[WARN] ${repository} failed to write results`;

export const OVERFLOWING_ROWS_TOP = (overflowingRowCount: number): string =>
    `[⬆ to see ${overflowingRowCount} lines above]`;

export const OVERFLOWING_ROWS_BOTTOM = (overflowingRowCount: number): string =>
    `[⬇ to see ${overflowingRowCount} lines below]`;

export const SCAN_FINISHED = (scannedRepositories: number): string =>
    `[DONE] Finished scan of ${scannedRepositories} repositories`;
