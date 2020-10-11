import chalk from 'chalk';

import config from '../config';
import * as Templates from './log-templates';
import { LogMessage, Task, Listeners, Listener } from './types';

const CI_KEEP_ALIVE_INTERVAL = 5 * 60 * 1000;
const execute = (method: Listener) => method();

/**
 * Logger for updating the terminal with current status
 */
class ProgressLogger {
    /** Messages printed as a list under tasks */
    messages: LogMessage[] = [];

    /** Messages of the task runners */
    tasks: Task[] = [];

    /** Count of finished repositories */
    scannedRepositories = 0;

    /** Event listeners */
    listeners: Listeners = {
        exit: [],
        taskStart: [],
        taskEnd: [],
        message: [],
    };

    /** Interval of CI status messages. Used to avoid CIs timeouting. */
    ciKeepAliveIntervalHandle: NodeJS.Timeout | null = null;

    constructor() {
        if (config.CI) {
            this.ciKeepAliveIntervalHandle = setInterval(() => {
                this.onCiStatus();
            }, CI_KEEP_ALIVE_INTERVAL);
        }
    }

    /**
     * Subscribe on logger's events
     */
    on(event: keyof Listeners, listener: Listener) {
        switch (event) {
            case 'message':
                return this.listeners.message.push(listener);

            case 'taskEnd':
                return this.listeners.taskEnd.push(listener);

            case 'exit':
                return this.listeners.exit.push(listener);
        }
    }

    /**
     * Add new message to logger
     */
    addNewMessage(message: LogMessage) {
        this.messages.push(message);
        this.listeners.message.forEach(execute);
    }

    /**
     * Add final message and fire exit event
     */
    onAllRepositoriesScanned() {
        this.addNewMessage({
            content: Templates.SCAN_FINISHED(this.scannedRepositories),
            color: chalk.green,
        });

        // Stop CI messages
        if (this.ciKeepAliveIntervalHandle !== null) {
            clearInterval(this.ciKeepAliveIntervalHandle);
        }

        this.listeners.exit.forEach(execute);
    }

    /**
     * Apply updates to given task
     */
    updateTask(repository: string, updates: Omit<Task, 'repository'>) {
        const taskExists = this.tasks.find(
            task => task.repository === repository
        );
        let ciMessage;

        if (taskExists) {
            this.tasks = this.tasks.map(task => {
                if (task.repository !== repository) {
                    return task;
                }

                const updatedTask = { ...task, ...updates };
                if (task.step !== updates.step) {
                    ciMessage = Templates.TASK_TEMPLATE(updatedTask);
                }

                return updatedTask;
            });
        } else {
            const task = { repository, ...updates };
            this.tasks.push(task);

            ciMessage = Templates.TASK_TEMPLATE(task);
        }

        // Keep CI updated of new tasks and their step changes
        if (config.CI && ciMessage) {
            this.addNewMessage({ content: ciMessage, color: updates.color });
        }
    }

    /**
     * Apply warning to given task. Duplicate warnings are ignored.
     * Returns boolean indicating whether warning did not exist on task already
     */
    addWarningToTask(repository: string, warning: string): boolean {
        const task = this.tasks.find(task => task.repository === repository);

        if (task) {
            const warnings = task.warnings || [];
            const hasWarnedAlready = warnings.includes(warning);

            if (!hasWarnedAlready) {
                this.updateTask(repository, {
                    warnings: [...warnings, warning],
                });

                return true;
            }
        }

        return false;
    }

    /**
     * Log start of task runner
     */
    onTaskStart(repository: string) {
        this.updateTask(repository, {
            step: 'START',
            color: chalk.yellow,
        });

        this.listeners.taskStart.forEach(execute);
    }

    /**
     * Log start of linting of given repository
     */
    onLintStart(repository: string, fileCount: number) {
        this.updateTask(repository, {
            fileCount,
            currentFileIndex: 0,
            step: 'LINT',
            color: chalk.yellow,
        });
    }

    /**
     * Log end of linting of given repository
     */
    onLintEnd(repository: string, resultCount: number) {
        this.scannedRepositories++;
        this.tasks = this.tasks.filter(task => task.repository !== repository);

        this.addNewMessage({
            content: Templates.LINT_END_TEMPLATE(repository, resultCount),
            color: resultCount > 0 ? chalk.red : chalk.green,
        });

        this.listeners.taskEnd.forEach(execute);
    }

    /**
     * Log end of a single file lint
     */
    onFileLintEnd(repository: string, currentFileIndex: number) {
        this.updateTask(repository, {
            currentFileIndex,
            step: 'LINT',
            color: chalk.green,
        });
    }

    /**
     * Log warning about slow linting
     */
    onFileLintSlow(repository: string, lintTime: number, file: string) {
        const isNewWarning = this.addWarningToTask(repository, file);

        if (isNewWarning) {
            this.addNewMessage({
                content: Templates.LINT_SLOW_TEMPLATE(lintTime, file),
                color: chalk.yellow,
            });
        }
    }

    /**
     * Log warning about linter crashing
     */
    onLinterCrash(repository: string, erroneousRule: string) {
        const isNewWarning = this.addWarningToTask(repository, erroneousRule);

        if (isNewWarning) {
            this.addNewMessage({
                content: Templates.LINT_FAILURE_TEMPLATE(
                    repository,
                    erroneousRule
                ),
                color: chalk.yellow,
            });
        }
    }

    /**
     * Log warning about worker crashing
     */
    onWorkerCrash(repository: string, errorCode?: string) {
        const isNewWarning = this.addWarningToTask(repository, 'worker-crash');

        if (isNewWarning) {
            this.addNewMessage({
                content: Templates.WORKER_FAILURE_TEMPLATE(
                    repository,
                    errorCode
                ),
                color: chalk.yellow,
            });
        }
    }

    /**
     * Log warning about clone failure
     */
    onCloneFailure(repository: string) {
        this.addNewMessage({
            content: Templates.CLONE_FAILURE_TEMPLATE(repository),
            color: chalk.yellow,
        });
    }

    /**
     * Log warning about pull failure
     */
    onPullFailure(repository: string) {
        this.addNewMessage({
            content: Templates.PULL_FAILURE_TEMPLATE(repository),
            color: chalk.yellow,
        });
    }

    /**
     * Log warning about filesystem read failure
     */
    onReadFailure(repository: string) {
        this.addNewMessage({
            content: Templates.READ_FAILURE_TEMPLATE(repository),
            color: chalk.yellow,
        });
    }

    /**
     * Log warning about result writing failure
     */
    onWriteFailure(repository: string) {
        this.addNewMessage({
            content: Templates.WRITE_FAILURE_TEMPLATE(repository),
            color: chalk.yellow,
        });
    }

    /**
     * Log start of cloning of given repository
     */
    onRepositoryClone(repository: string) {
        this.updateTask(repository, { step: 'CLONE', color: chalk.yellow });
    }

    /**
     * Log start of pulling of given repository
     */
    onRepositoryPull(repository: string) {
        this.updateTask(repository, { step: 'PULL', color: chalk.yellow });
    }

    /**
     * Log start of cloning of given repository
     */
    onRepositoryRead(repository: string) {
        this.updateTask(repository, { step: 'READ', color: chalk.yellow });
    }

    /**
     * Log status of scanning to CI
     */
    onCiStatus() {
        this.addNewMessage({
            content: Templates.CI_STATUS_TEMPLATE(this.scannedRepositories),
            color: chalk.yellow,
        });
    }
}

export default new ProgressLogger();
