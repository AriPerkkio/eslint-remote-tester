import { Task } from './types';
import config from '@config';
import { CACHE_LOCATION } from '@file-client';

// Regexp for converting `[INFO][LINTING] reponame` to `[INFO/LINTING] reponame`
const CI_TEMPLATE_TASK_REGEXP = /\]\[/;

/**
 * Format seconds into display format, e.g. 36092 -> 10h 1m 32s
 */
function formatSeconds(timeSeconds: number): string {
    const hours = Math.floor(timeSeconds / 3600);
    const minutes = Math.floor((timeSeconds % 3600) / 60);
    const seconds = Math.floor(timeSeconds % 60);

    return [
        hours && `${hours}h`,
        minutes && `${minutes}m`,
        seconds && `${seconds}s`,
    ]
        .filter(Boolean)
        .join(' ');
}

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

export const CI_STATUS_TEMPLATE = (
    scannedRepositories: number,
    tasks: Task[]
): string => `[INFO/STATUS] ${REPOSITORIES_STATUS_TEMPLATE(scannedRepositories)}
${tasks.map(task => CI_TASK_TEMPLATE(task)).join('\n')}\n`;

const CI_TASK_TEMPLATE = (task: Task): string =>
    `[INFO]${TASK_TEMPLATE(task)}`.replace(CI_TEMPLATE_TASK_REGEXP, '/');

export const LINT_END_TEMPLATE = (
    repository: string,
    errorCount: number
): string =>
    errorCount > 0
        ? `[ERROR] ${repository} ${errorCount} errors`
        : `[SUCCESS] ${repository}`;

export const LINT_SLOW_TEMPLATE = (lintTime: number, file: string): string => {
    const path = file.replace(`${CACHE_LOCATION}/`, '').split('/');
    const fileName = path.pop();

    return `[WARN] Linting ${fileName} took ${lintTime}s at ${path.join('/')}`;
};

export const LINT_FAILURE_TEMPLATE = (
    repository: string,
    rule?: string
): string => `[ERROR] ${repository} crashed${rule ? `: ${rule}` : ''}`;

export const WORKER_FAILURE_TEMPLATE = (
    repository: string,
    errorCode?: string
): string =>
    `[ERROR] Worker crashed on ${repository}${
        errorCode ? ` (${errorCode})` : ''
    }`;

export const PULL_FAILURE_TEMPLATE = (repository: string): string =>
    `[ERROR] ${repository} failed to pull`;

export const CLONE_FAILURE_TEMPLATE = (repository: string): string =>
    `[ERROR] ${repository} failed to clone`;

export const READ_FAILURE_TEMPLATE = (repository: string): string =>
    `[ERROR] ${repository} failed to read files`;

export const WRITE_FAILURE_TEMPLATE = (repository: string): string =>
    `[ERROR] ${repository} failed to write results`;

export const OVERFLOWING_ROWS_TOP = (overflowingRowCount: number): string =>
    `[\u25B2 to see ${overflowingRowCount} lines above]`;

export const OVERFLOWING_ROWS_BOTTOM = (overflowingRowCount: number): string =>
    `[\u25BC to see ${overflowingRowCount} lines below]`;

export const SCAN_TIMELIMIT_REACHED = (timeSeconds: number): string =>
    `[DONE] Reached scan time limit ${formatSeconds(timeSeconds)}`;

export const SCAN_FINISHED = (scannedRepositories: number): string =>
    `[DONE] Finished scan of ${scannedRepositories} repositories`;
