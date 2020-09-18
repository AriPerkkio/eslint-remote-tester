import chalk from 'chalk';

import config from './config';

interface Task {
    step: 'CLONE' | 'READ' | 'LINT';
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

        case 'READ':
            return `${chalk.yellow('[READING]')} ${task.repository}`;

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
    intervalHandle: NodeJS.Timeout;

    constructor() {
        this.messages = [];
        this.tasks = [];
        this.scannedRepositories = 0;

        this.intervalHandle = setInterval(() => {
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
        this.print();
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
     * Log start of cloning of given repository
     */
    onRepositoryRead(repository: string) {
        this.updateTask(repository, { step: 'READ' });
        this.print();
    }

    /**
     * Print current tasks and messages
     */
    print() {
        const formattedMessage = [
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
