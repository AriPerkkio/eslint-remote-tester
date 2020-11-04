import * as Templates from './log-templates';
import { LogMessage, Task, Listeners, Listener, ListenerType } from './types';
import config from '@config';

const CI_KEEP_ALIVE_INTERVAL_MS = 15 * 1000;

/**
 * Logger for holding state of current progress
 * - Exposes different logs via `on` subscribe method
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
        message: [],
        task: [],
        ciKeepAlive: [],
    };

    /** Interval of CI status messages. Used to avoid CIs timeouting. */
    ciKeepAliveIntervalHandle: NodeJS.Timeout | null = null;

    constructor() {
        if (config.CI) {
            this.ciKeepAliveIntervalHandle = setInterval(() => {
                this.onCiStatus();
            }, CI_KEEP_ALIVE_INTERVAL_MS);
        }
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
        this.listeners.message.forEach(listener => listener(message));
    }

    /**
     * Add final message and fire exit event
     */
    onAllRepositoriesScanned() {
        this.addNewMessage({
            content: Templates.SCAN_FINISHED(this.scannedRepositories),
            color: 'green',
        });

        // Stop CI messages
        if (this.ciKeepAliveIntervalHandle !== null) {
            clearInterval(this.ciKeepAliveIntervalHandle);
        }

        this.listeners.exit.forEach(listener => listener());
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

        this.listeners.task.forEach(listener => listener(updatedTask));
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
        this.scannedRepositories++;
        this.addNewMessage({
            content: Templates.LINT_END_TEMPLATE(repository, resultCount),
            color: resultCount > 0 ? 'red' : 'green',
        });

        const task = this.tasks.find(task => task.repository === repository);

        if (task) {
            this.tasks = this.tasks.filter(t => t !== task);
            this.listeners.task.forEach(listener => listener(task, true));
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
                color: 'yellow',
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
                color: 'yellow',
            });
        }
    }

    /**
     * Log warning about clone failure
     */
    onCloneFailure(repository: string) {
        this.addNewMessage({
            content: Templates.CLONE_FAILURE_TEMPLATE(repository),
            color: 'yellow',
        });
    }

    /**
     * Log warning about pull failure
     */
    onPullFailure(repository: string) {
        this.addNewMessage({
            content: Templates.PULL_FAILURE_TEMPLATE(repository),
            color: 'yellow',
        });
    }

    /**
     * Log warning about filesystem read failure
     */
    onReadFailure(repository: string) {
        this.addNewMessage({
            content: Templates.READ_FAILURE_TEMPLATE(repository),
            color: 'yellow',
        });
    }

    /**
     * Log warning about result writing failure
     */
    onWriteFailure(repository: string) {
        this.addNewMessage({
            content: Templates.WRITE_FAILURE_TEMPLATE(repository),
            color: 'yellow',
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
     */
    onCiStatus() {
        const message = Templates.CI_STATUS_TEMPLATE(this.scannedRepositories);

        this.listeners.ciKeepAlive.forEach(listener => listener(message));
    }
}

export default new ProgressLogger();
