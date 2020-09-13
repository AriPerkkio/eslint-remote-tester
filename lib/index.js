#!/usr/bin/env node

const engine = require('./engine');
const client = require('./client');
const config = require('./config');
const resultParser = require('./results-parser');
const logger = require('./process-logger');

const DEFAULT_CONCURRENT_TASKS = 5;

/**
 * Scan given repository
 *
 * @param {String} repository Repository to scan
 */
async function scanRepo(repository) {
    const files = await client.getFiles(repository);
    const results = [];

    logger.onLintStart(repository, files.length);

    for (const file of files) {
        const lintMessages = await engine.lint(file);
        results.push(...lintMessages);
    }

    resultParser.writeResults(results, repository);
    logger.onLintEnd(repository, results.length);
}

/**
 * Entrypoint of the application.
 * Runs ESLint to given repositories and filters out only the rule being under testing.
 * Results are written to ./results directory.
 */
(async function main() {
    const pool = config.repositories.map(repos => () => scanRepo(repos));

    async function execute() {
        const task = pool.shift();

        if (task) {
            await task();
            return execute();
        }
    }

    // Start x amount of task runners parallel until we are out of repositories to scan
    await Promise.all(
        Array(config.concurrentTasks || DEFAULT_CONCURRENT_TASKS)
            .fill(execute)
            .map(task => task())
    );
})();
