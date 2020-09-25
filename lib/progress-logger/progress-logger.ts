import chalk, { Chalk } from 'chalk';

import diffLogs from './log-diff';
import * as Templates from './log-templates';
import { LogMessage, Task } from './types';

const REFRESH_INTERVAL_MS = 200;
const DEFAULT_COLOR_METHOD = (c: string) => c;

/**
 * Logger for updating the terminal with current status
 * - Updates are printed based on `REFRESH_INTERVAL_MS`
 * - Should be ran on main thread separate from worker threads in order to
 *   avoid blocking updates
 */
class ProgressLogger {
    /** Messages printed as a list under tasks */
    messages: LogMessage[];

    /** Messages of the task runners */
    tasks: Task[];

    /** Count of finished repositories */
    scannedRepositories: number;

    /** Handle of refresh interval */
    intervalHandle: NodeJS.Timeout;

    /** Contents of previous log. Used to diff new contents */
    previousLog: string;

    /** Colors of previous log */
    previousColors: Chalk[];

    constructor() {
        this.messages = [];
        this.tasks = [];
        this.scannedRepositories = 0;
        this.previousLog = '';
        this.previousColors = [];

        this.intervalHandle = setInterval(() => {
            this.print();
        }, REFRESH_INTERVAL_MS);

        // On terminal height change full print is required
        process.stdout.on('resize', () => {
            this.previousLog = '';
            this.previousColors = [];
        });

        console.clear();
    }

    /**
     * Clear refresh interval
     */
    onAllRepositoriesScanned() {
        this.messages.push({
            content: `[DONE] Finished scan of ${this.scannedRepositories} repositories`,
            color: chalk.green,
        });

        // Stop updating afer one final printing
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

        const hasErrors = resultCount > 0;
        const color = hasErrors ? chalk.red : chalk.green;
        const postfix = hasErrors
            ? `with ${resultCount} errors`
            : 'without errors';

        this.messages.push({
            content: `[DONE] ${repository} ${postfix}`,
            color,
        });
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
     * Log warning about linter crashing
     */
    onLinterCrash(repository: string, erroneousRule: string) {
        const isNewWarning = this.addWarningToTask(repository, erroneousRule);

        if (isNewWarning) {
            this.messages.push({
                content: Templates.LINT_FAILURE_TEMPLATE(
                    repository,
                    erroneousRule
                ),
                color: chalk.yellow,
            });
        }
    }

    /**
     * Log warning about clone failure
     */
    onCloneFailure(repository: string) {
        this.messages.push({
            content: Templates.CLONE_FAILURE_TEMPLATE(repository),
            color: chalk.yellow,
        });
    }

    /**
     * Log warning about filesystem read failure
     */
    onReadFailure(repository: string) {
        this.messages.push({
            content: Templates.READ_FAILURE_TEMPLATE(repository),
            color: chalk.yellow,
        });
    }

    /**
     * Log warning about result writing failure
     */
    onWriteFailure(repository: string) {
        this.messages.push({
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
     * Log start of cloning of given repository
     */
    onRepositoryRead(repository: string) {
        this.updateTask(repository, { step: 'READ', color: chalk.yellow });
    }

    /**
     * Print current tasks and messages
     */
    print() {
        const terminalHeight = process.stdout.rows;
        // TODO [... and 5 hidden lines below]

        const rows = [
            Templates.REPOSITORIES_STATUS_TEMPLATE(this.scannedRepositories),
            ...this.tasks.map(Templates.TASK_TEMPLATE),
            ' ', // Empty line between tasks and messages
            ...this.messages.map(message => message.content),
        ].slice(0, terminalHeight);

        const colors = [
            null,
            ...this.tasks.map(task => task.color),
            null,
            ...this.messages.map(message => message.color),
        ].slice(0, terminalHeight);

        // Update colors of whole row
        for (const [rowIndex, color] of colors.entries()) {
            if (this.previousColors[rowIndex] !== color) {
                const row = rows[rowIndex];
                const colorMethod = color || DEFAULT_COLOR_METHOD;

                process.stdout.cursorTo(0, rowIndex);
                process.stdout.clearLine(0);
                process.stdout.write(colorMethod(row));
            }
        }

        const formattedLog = rows.join('\n');
        const updates = diffLogs(this.previousLog, formattedLog);
        this.previousLog = formattedLog;

        // Update single character changes, e.g. step or file count changes
        for (const { x, y, character } of updates) {
            const colorMethod = colors[y] || DEFAULT_COLOR_METHOD;

            // These were already updated by row's color update
            if (this.previousColors[y] !== colors[y]) continue;

            process.stdout.cursorTo(x, y);
            process.stdout.write(colorMethod(character));
        }
        this.previousColors = colors;

        process.stdout.cursorTo(0, terminalHeight);
    }
}

export default new ProgressLogger();
