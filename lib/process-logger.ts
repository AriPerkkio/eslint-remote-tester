import chalk from 'chalk';

import config from './config';

interface Task {
    step: 'CLONE' | 'LINT';
    repository: string;
    fileCount?: number;
    currentFileIndex?: number;
}

// How often logger should refresh termnial
const REFRESH_INTERVAL_MS = 200;

const TASK_TEMPLATE = (task: Task) => {
    switch (task.step) {
        case 'CLONE':
            return `${chalk.yellow('[CLONING]')} ${task.repository}`;

        case 'LINT':
            return (
                `${chalk.green('[LINTING]')} ${task.repository} - ` +
                `${task.currentFileIndex}/${task.fileCount} files`
            );

        default:
            return `Unknown step ${task.step}`;
    }
};

class ProcessLogger {
    messages: string[];
    tasks: Task[];
    scannedRepositories: number;
    timerMs: number;
    intervalHandle: NodeJS.Timeout;

    constructor() {
        this.messages = [];
        this.tasks = [];
        this.scannedRepositories = 0;
        this.timerMs = 0;

        this.intervalHandle = setInterval(() => {
            this.timerMs += REFRESH_INTERVAL_MS;
            this.print();
        }, REFRESH_INTERVAL_MS);
    }

    /**
     * Clear refresh interval
     */
    onAllRepositoriesScanned() {
        this.messages.push(
            chalk.green(
                `[DONE] Finished scan of ${this.scannedRepositories} repositories`
            )
        );

        setTimeout(() => {
            clearTimeout(this.intervalHandle);
        }, REFRESH_INTERVAL_MS);
    }

    /**
     * Apply updates to given task
     */
    updateTask(repository: string, updates: Omit<Task, 'repository'>) {
        const taskExists = this.tasks.find(
            task => task.repository === repository
        );

        if (taskExists) {
            this.tasks = this.tasks.map(task => {
                if (task.repository !== repository) {
                    return task;
                }

                return { ...task, ...updates };
            });
        } else {
            this.tasks.push({ repository, ...updates });
        }
    }

    /**
     * Log start of linting of given repository
     *
     */
    onLintStart(repository: string, fileCount: number) {
        this.updateTask(repository, {
            fileCount,
            currentFileIndex: 0,
            step: 'LINT',
        });
    }

    /**
     * Log end of linting of given repository
     */
    onLintEnd(repository: string, resultCount: number) {
        this.scannedRepositories++;
        this.tasks = this.tasks.filter(task => task.repository !== repository);

        const hasErrors = resultCount > 0;
        const color = hasErrors ? chalk.red : chalk.green;
        const postfix = hasErrors
            ? `with ${resultCount} errors`
            : 'without errors';

        this.messages.push(color(`[DONE] ${repository} ${postfix}`));
    }

    onFileLintEnd(repository: string, currentFileIndex: number) {
        this.updateTask(repository, { currentFileIndex, step: 'LINT' });
    }

    /**
     * Log start of cloning of given repository
     */
    onRepositoryClone(repository: string) {
        this.updateTask(repository, { step: 'CLONE' });
    }

    /**
     * Print current tasks and messages
     */
    print() {
        const timeSeconds = Math.floor(this.timerMs / 1000);

        const formattedMessage = [
            `Time ${timeSeconds}s`,
            `Repositories (${this.scannedRepositories}/${config.repositories.length})`,
            ...this.tasks.map(TASK_TEMPLATE),
            ' ', // Empty line between tasks and messages
            ...this.messages,
        ]
            .filter(Boolean)
            .join('\n');

        console.clear();
        console.log(formattedMessage);
    }
}

export default new ProcessLogger();
