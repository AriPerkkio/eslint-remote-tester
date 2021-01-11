import chalk from 'chalk';

import * as Templates from './log-templates';
import exitHandler from './exit-handler';
import { LogMessage, Task, Listeners, Listener, ListenerType } from './types';
import config from '@config';

const CI_KEEP_ALIVE_INTERVAL_MS = 4.5 * 60 * 1000;
const DEFAULT_COLOR = (text: string) => text;

/**
 * Resolve color for message or task
 */
export function resolveColor(
    taskOrMessage: Task | LogMessage
): typeof DEFAULT_COLOR {
    return (taskOrMessage.color && chalk[taskOrMessage.color]) || DEFAULT_COLOR;
}

/**
 * Check whether log is filtered out by `config.logLevel`
 */
function isLogVisible(log: LogMessage): boolean {
    switch (config.logLevel) {
        case 'verbose':
            return true;

        case 'info':
            return ['info', 'warn', 'error'].includes(log.level);

        case 'warn':
            return ['warn', 'error'].includes(log.level);

        case 'error':
            return log.level === 'error';

        default:
            return false;
    }
}

/**
 * Check whether task is filtered out by `config.logLevel`
 * - Tasks are considered as "logs" on CI only. CLI mode displays only active ones.
 */
function isTasksVisible(): boolean {
    return config.CI === false || config.logLevel === 'verbose';
}

/**
 * Logger for holding state of current progress
 * - Exposes different logs via `on` subscribe method
 */
class ProgressLogger {
    /** Messages printed as a list under tasks */
    private messages: LogMessage[] = [];

    /** Messages of the task runners */
    private tasks: Task[] = [];

    /** Count of finished repositories */
    scannedRepositories = 0;

    /** Event listeners */
    private listeners: Listeners = {
        exit: [],
        message: [],
        task: [],
        ciKeepAlive: [],
        timeout: [],
    };

    /** Indicates whether scan has reached time limit set by `config.timeLimit` */
    private hasTimedout = false;

    /** Handle of scan timeout. Used to interrupt scan once time limit has been reached. */
    private scanTimeoutHandle: NodeJS.Timeout | null = null;

    /** Interval of CI status messages. Used to avoid CIs timeouting due to silent stdout. */
    private ciKeepAliveIntervalHandle: NodeJS.Timeout | null = null;

    constructor() {
        if (config.CI) {
            this.ciKeepAliveIntervalHandle = setInterval(() => {
                this.onCiStatus();
            }, CI_KEEP_ALIVE_INTERVAL_MS);
        }

        this.scanTimeoutHandle = setTimeout(() => {
            this.onScanTimeout();
        }, config.timeLimit * 1000);
    }

    /**
     * Subscribe on logger's events
     */
    on<T = ListenerType>(event: T & ListenerType, listener: Listener<T>) {
        const eventListeners = this.listeners[event];

        if (eventListeners) {
            eventListeners.push(listener as any);
        }

        return this;
    }

    /**
     * Unsubscribe from logger's events
     */
    off<T = ListenerType>(event: T & ListenerType, listener: Listener<T>) {
        const eventListeners = this.listeners[event];

        if (eventListeners) {
            const index = eventListeners.indexOf(listener as any);

            if (index !== -1) {
                eventListeners.splice(index, 1);
            }
        }

        return this;
    }

    /**
     * Add new message to logger
     */
    addNewMessage(message: LogMessage) {
        this.messages.push(message);

        if (isLogVisible(message)) {
            this.listeners.message.forEach(listener => listener(message));
        }
    }

    /**
     * Get current log messages
     */
    getMessages(): LogMessage[] {
        return this.messages.filter(message => isLogVisible(message));
    }

    /**
     * Check whether scan has timed out
     */
    isTimeout(): boolean {
        return this.hasTimedout;
    }

    /**
     * Add final message and fire exit event
     */
    onAllRepositoriesScanned() {
        this.addNewMessage({
            content: Templates.SCAN_FINISHED(this.scannedRepositories),
            color: 'green',
            level: 'verbose',
        });

        if (this.ciKeepAliveIntervalHandle !== null) {
            clearInterval(this.ciKeepAliveIntervalHandle);
        }

        if (this.scanTimeoutHandle !== null) {
            clearTimeout(this.scanTimeoutHandle);
        }

        const notifyListeners = () =>
            this.listeners.exit.forEach(listener => listener());

        // Erroneous exit handler should not crash whole application.
        // Log the error and move on.
        exitHandler()
            .then(messages => {
                messages.forEach(message => this.addNewMessage(message));
                notifyListeners();
            })
            .catch(error => {
                console.error(error);
                notifyListeners();
            });
    }

    /**
     * Apply updates to given task
     */
    updateTask(repository: string, updates: Omit<Task, 'repository'>) {
        const taskExists = this.tasks.find(
            task => task.repository === repository
        );
        let updatedTask: Task;

        if (taskExists) {
            this.tasks = this.tasks.map(task => {
                if (task.repository !== repository) {
                    return task;
                }

                updatedTask = { ...task, ...updates };
                return updatedTask;
            });
        } else {
            updatedTask = { repository, ...updates };
            this.tasks.push(updatedTask);
        }

        if (isTasksVisible()) {
            this.listeners.task.forEach(listener => listener(updatedTask));
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
            color: 'yellow',
        });
    }

    /**
     * Log start of linting of given repository
     */
    onLintStart(repository: string, fileCount: number) {
        this.updateTask(repository, {
            fileCount,
            currentFileIndex: 0,
            step: 'LINT',
            color: 'yellow',
        });
    }

    /**
     * Log end of linting of given repository
     */
    onLintEnd(repository: string, resultCount: number) {
        const hasErrors = resultCount > 0;

        this.scannedRepositories++;
        this.addNewMessage({
            content: Templates.LINT_END_TEMPLATE(repository, resultCount),
            color: hasErrors ? 'red' : 'green',
            level: hasErrors ? 'error' : 'verbose',
        });

        const task = this.tasks.find(task => task.repository === repository);

        if (task) {
            this.tasks = this.tasks.filter(t => t !== task);

            if (isTasksVisible()) {
                this.listeners.task.forEach(listener => listener(task, true));
            }
        }
    }

    /**
     * Log end of a single file lint
     */
    onFileLintEnd(repository: string, currentFileIndex: number) {
        this.updateTask(repository, {
            currentFileIndex,
            step: 'LINT',
            color: 'green',
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
                color: 'yellow',
                level: 'warn',
            });
        }
    }

    /**
     * Log error about linter crashing
     */
    onLinterCrash(repository: string, erroneousRule: string) {
        const isNewWarning = this.addWarningToTask(repository, erroneousRule);

        if (isNewWarning) {
            this.addNewMessage({
                content: Templates.LINT_FAILURE_TEMPLATE(
                    repository,
                    erroneousRule
                ),
                color: 'red',
                level: 'error',
            });
        }
    }

    /**
     * Log error about worker crashing
     */
    onWorkerCrash(repository: string, errorCode?: string) {
        const isNewWarning = this.addWarningToTask(repository, 'worker-crash');

        if (isNewWarning) {
            this.addNewMessage({
                content: Templates.WORKER_FAILURE_TEMPLATE(
                    repository,
                    errorCode
                ),
                color: 'red',
                level: 'error',
            });
        }
    }

    /**
     * Log error about clone failure
     */
    onCloneFailure(repository: string) {
        this.addNewMessage({
            content: Templates.CLONE_FAILURE_TEMPLATE(repository),
            color: 'red',
            level: 'error',
        });
    }

    /**
     * Log error about pull failure
     */
    onPullFailure(repository: string) {
        this.addNewMessage({
            content: Templates.PULL_FAILURE_TEMPLATE(repository),
            color: 'red',
            level: 'error',
        });
    }

    /**
     * Log error about filesystem read failure
     */
    onReadFailure(repository: string) {
        this.addNewMessage({
            content: Templates.READ_FAILURE_TEMPLATE(repository),
            color: 'red',
            level: 'error',
        });
    }

    /**
     * Log error about result writing failure
     */
    onWriteFailure(repository: string) {
        this.addNewMessage({
            content: Templates.WRITE_FAILURE_TEMPLATE(repository),
            color: 'red',
            level: 'error',
        });
    }

    /**
     * Log start of cloning of given repository
     */
    onRepositoryClone(repository: string) {
        this.updateTask(repository, { step: 'CLONE', color: 'yellow' });
    }

    /**
     * Log start of pulling of given repository
     */
    onRepositoryPull(repository: string) {
        this.updateTask(repository, { step: 'PULL', color: 'yellow' });
    }

    /**
     * Log start of cloning of given repository
     */
    onRepositoryRead(repository: string) {
        this.updateTask(repository, { step: 'READ', color: 'yellow' });
    }

    /**
     * Log status of scanning to CI
     * - These are used to avoid CI timeouts
     */
    onCiStatus() {
        if (['verbose', 'info'].includes(config.logLevel)) {
            const message = Templates.CI_STATUS_TEMPLATE(
                this.scannedRepositories,
                this.tasks
            );

            this.listeners.ciKeepAlive.forEach(listener => listener(message));
        }
    }

    /**
     * Log notification about reaching scan time limit and notify listeners
     */
    private onScanTimeout() {
        this.addNewMessage({
            content: Templates.SCAN_TIMELIMIT_REACHED(config.timeLimit),
            level: 'info',
            color: 'yellow',
        });
        this.hasTimedout = true;
        this.listeners.timeout.forEach(listener => listener());
    }
}

export default new ProgressLogger();
