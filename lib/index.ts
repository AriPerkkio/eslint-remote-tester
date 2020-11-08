#!/usr/bin/env node

import { renderApplication } from '@ui';
import config from '@config';
import engine, { WorkerMessage } from '@engine';
import { writeResults, clearResults } from '@file-client';
import logger from '@progress-logger';

/**
 * Entrypoint of the application.
 * Runs ESLint to given repositories and filters out only the rules being under testing.
 * Results are written to ./eslint-remote-tester-results directory.
 */
async function main() {
    const pool = config.repositories.map(repo => () => scanRepo(repo));

    async function execute(): Promise<void> {
        const task = pool.shift();

        if (task) {
            await task();
            return execute();
        }
    }

    // Clear possible earlier results / initialize results folder
    clearResults();

    // Render application to stdout
    renderApplication();

    // Start x amount of task runners parallel until we are out of repositories to scan
    await Promise.all(
        Array(config.concurrentTasks)
            .fill(execute)
            .map(task => task())
    );

    logger.onAllRepositoriesScanned();
}

/**
 * Run repository scanning on separate thread in order to keep main one
 * free for logger updates
 */
async function scanRepo(repository: string) {
    const results = await engine.scanRepository(
        repository,
        (message: WorkerMessage) => {
            switch (message.type) {
                case 'START':
                    return logger.onTaskStart(repository);

                case 'READ':
                    return logger.onRepositoryRead(repository);

                case 'CLONE':
                    return logger.onRepositoryClone(repository);

                case 'PULL':
                    return logger.onRepositoryPull(repository);

                case 'LINT_START':
                    return logger.onLintStart(repository, message.payload);

                case 'FILE_LINT_END':
                    return logger.onFileLintEnd(repository, message.payload);

                case 'FILE_LINT_SLOW':
                    return logger.onFileLintSlow(
                        repository,
                        message.payload.lintTime,
                        message.payload.path
                    );

                case 'LINTER_CRASH':
                    return logger.onLinterCrash(repository, message.payload);

                case 'WORKER_ERROR':
                    return logger.onWorkerCrash(repository, message.payload);

                case 'CLONE_FAILURE':
                    return logger.onCloneFailure(repository);

                case 'PULL_FAILURE':
                    return logger.onPullFailure(repository);

                case 'READ_FAILURE':
                    return logger.onReadFailure(repository);

                // Since debugging worker threads is not possible on VS code
                // this message type is used for debugging.
                // Simply call postMessage({ type: 'DEBUG', payload: ... }) on
                // worker thread and place breakpoint here
                case 'DEBUG':
                    return;
            }
        }
    );

    try {
        writeResults(results, repository);
    } catch (e) {
        logger.onWriteFailure(repository);
    }

    logger.onLintEnd(repository, results.length);
}

// Run entrypoint and export handle for tests to await for
export const __handleForTests = main();
