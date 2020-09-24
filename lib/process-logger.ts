import chalk, { Chalk } from 'chalk';

import config from './config';

interface Task {
    step?: 'CLONE' | 'READ' | 'LINT';
    color?: Chalk;
    repository: string;
    fileCount?: number;
    currentFileIndex?: number;
    warnings?: string[];
}

interface LogMessage {
    content: string;
    color?: Chalk;
}

interface LogUpdate {
    character: string;
    x: number;
    y: number;
}

// Interval of how often logger should refresh termnial
const REFRESH_INTERVAL_MS = 200;

const DEFAULT_COLOR_METHOD = (c: string) => c;
const TASK_TEMPLATE = (task: Task) => {
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
const REPOSITORIES_STATUS_TEMPLATE = (scannedRepositories: number) =>
    `Repositories (${scannedRepositories}/${config.repositories.length})`;

const LINT_FAILURE_TEMPLATE = (repository: string, rule?: string) =>
    `[WARN] ${repository} crashed${rule ? `: ${rule}` : ''}`;
const CLONE_FAILURE_TEMPLATE = (repository: string) =>
    `[WARN] ${repository} failed to clone`;
const READ_FAILURE_TEMPLATE = (repository: string) =>
    `[WARN] ${repository} failed to read files`;
const WRITE_FAILURE_TEMPLATE = (repository: string) =>
    `[WARN] ${repository} failed to write results`;

/**
 * Logger for updating the terminal with current status
 * - Updates are printed based on `REFRESH_INTERVAL_MS`
 * - Should be ran on main thread separate from worker threads in order to
 *   avoid blocking updates
 */
class ProcessLogger {
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
                content: LINT_FAILURE_TEMPLATE(repository, erroneousRule),
                color: chalk.yellow,
            });
        }
    }

    /**
     * Log warning about clone failure
     */
    onCloneFailure(repository: string) {
        this.messages.push({
            content: CLONE_FAILURE_TEMPLATE(repository),
            color: chalk.yellow,
        });
    }

    /**
     * Log warning about filesystem read failure
     */
    onReadFailure(repository: string) {
        this.messages.push({
            content: READ_FAILURE_TEMPLATE(repository),
            color: chalk.yellow,
        });
    }

    /**
     * Log warning about result writing failure
     */
    onWriteFailure(repository: string) {
        this.messages.push({
            content: WRITE_FAILURE_TEMPLATE(repository),
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

        const rows = [
            REPOSITORIES_STATUS_TEMPLATE(this.scannedRepositories),
            ...this.tasks.map(TASK_TEMPLATE),
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

/**
 * Compares two given strings and construct `LogUpdate` steps of the changes
 * - This gets called during every print; optimization should be considered
 */
function diffLogs(previousLog: string, newLog: string): LogUpdate[] {
    const updates: LogUpdate[] = [];
    const previousRows = previousLog.split('\n');

    for (const [y, row] of newLog.split('\n').entries()) {
        const previousRow = previousRows[y];
        const characters = row.split('');

        if (!previousRow) {
            for (const [x, character] of characters.entries()) {
                updates.push({ character, x, y });
            }
            continue;
        }

        const previousCharacters = previousRow.split('');
        for (const [x, character] of characters.entries()) {
            if (character === previousCharacters[x]) continue;
            updates.push({ x, y, character });
        }

        if (previousCharacters.length > characters.length) {
            const rightPad = characters.length;

            for (let i = 0; i < previousCharacters.length - rightPad; i++) {
                updates.push({ x: rightPad + i, y, character: ' ' });
            }
        }
    }

    return updates;
}

export default new ProcessLogger();
