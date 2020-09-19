#!/usr/bin/env node

import engine from './engine';
import config from './config';
import logger from './process-logger';
import { writeResults } from './results-parser';
import { WorkerMessage } from './types';

const DEFAULT_CONCURRENT_TASKS = 5;

/**
 * Run repository scanning on separate thread in order to keep main one
 * free for logger updates
 */
async function scanRepo(repository: string) {
    const results = await engine.scanRepository(
        repository,
        (message: WorkerMessage) => {
            switch (message.type) {
                case 'READ':
                    return logger.onRepositoryRead(repository);

                case 'CLONE':
                    return logger.onRepositoryClone(repository);

                case 'LINT_START':
                    return logger.onLintStart(repository, message.payload);

                case 'FILE_LINT_END':
                    return logger.onFileLintEnd(repository, message.payload);
            }
        }
    );

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

    logger.onAllRepositoriesScanned();
})();
