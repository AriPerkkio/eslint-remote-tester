import chalk from 'chalk';

import config from './config';

interface Task {
    step: 'CLONE' | 'LINT';
    repository: string;
    fileCount?: number;
}

const TASK_TEMPLATE = (task: Task) => {
    if (task.step === 'CLONE') {
        return `${chalk.yellow('[CLONING]')} ${task.repository}`;
    }
    if (task.step === 'LINT') {
        return `${chalk.green('[LINTING]')} ${task.repository} - ${
            task.fileCount
        } files`;
    }
};

class ProcessLogger {
    messages: string[];
    tasks: Task[];
    scannedRepositories: number;

    constructor() {
        this.messages = [];
        this.tasks = [];
        this.scannedRepositories = 0;
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

        this.print();
    }

    /**
     * Log start of linting of given repository
     *
     */
    onLintStart(repository: string, fileCount: number) {
        this.updateTask(repository, { fileCount, step: 'LINT' });
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
        this.print();
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
        const formattedMessage = [
            `Status (${this.scannedRepositories}/${config.repositories.length})`,
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
