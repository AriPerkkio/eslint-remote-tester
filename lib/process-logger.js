const chalk = require('chalk');
const config = require('./config');

const CLONE = 'CLONE';
const LINT = 'LINT';
const TASK_TEMPLATE = task => {
    if (task.step === CLONE) {
        return `${chalk.yellow('[CLONING]')} ${task.repository}`;
    }
    if (task.step === LINT) {
        return `${chalk.green('[LINTING]')} ${task.repository} - ${
            task.fileCount
        } files`;
    }
};

class ProcessLogger {
    constructor() {
        /** @type {String[]} */
        this.messages = [];

        /** @type {Array.<{ repository: String, step: String }>} */
        this.tasks = [];

        /** @type {Number} */
        this.scannedRepositories = 0;
    }

    /**
     * Apply updates to given task
     *
     * @param {String} repository Repository of the task
     * @param {Object} updates Updates to apply
     * @private
     */
    updateTask(repository, updates) {
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
     * @param {String} repository Repository being linted
     * @param {Number} fileCount Count of files being linted
     */
    onLintStart(repository, fileCount) {
        this.updateTask(repository, { fileCount, step: LINT });
    }

    /**
     * Log end of linting of given repository
     *
     * @param {String} repository Linted repository
     * @param {Number} resultCount Count of linting results
     */
    onLintEnd(repository, resultCount) {
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
     *
     * @param {String} repository Linted repository
     */
    onRepositoryClone(repository) {
        this.updateTask(repository, { step: CLONE });
    }

    /**
     * Print current tasks and messages
     * @private
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

module.exports = new ProcessLogger();
