#!/usr/bin/env node

import engine from './engine';
import client from './client';
import config from './config';
import logger from './process-logger';
import { writeResults } from './results-parser';
import { LintMessage } from './types';

const DEFAULT_CONCURRENT_TASKS = 5;

/**
 * Scan given repository
 */
async function scanRepo(repository: string) {
    const files = await client.getFiles(repository);
    const results: LintMessage[] = [];

    logger.onLintStart(repository, files.length);

    for (const file of files) {
        const lintMessages = await engine.lint(file);
        results.push(...lintMessages);
    }

    writeResults(results, repository);
    logger.onLintEnd(repository, results.length);
}

/**
 * Entrypoint of the application.
 * Runs ESLint to given repositories and filters out only the rule being under testing.
 * Results are written to ./results directory.
 */
(async function main() {
    const pool = config.repositories.map(repos => () => scanRepo(repos));

    async function execute(): Promise<void> {
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
