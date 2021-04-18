import { Worker, isMainThread } from 'worker_threads';

import workerTask, { WorkerMessage, createErrorMessage } from './worker-task';
import { resolveConfigurationLocation } from '@config';

type WorkerCallback<T> = (worker: Worker) => T;
type CleanupCallback = () => void;
type EffectCallback = WorkerCallback<CleanupCallback>;

if (!isMainThread) {
    workerTask();
}

/**
 * Start scanning of given repository in a separate thread
 * - Keeps progress-logger up-to-date via onMessage
 */
function scanRepository(
    repository: string,
    onMessage: (message: WorkerMessage) => void,
    workerCallback: EffectCallback
): Promise<void> {
    return new Promise(resolve => {
        // Notify about worker starting. It can take a while to get worker starting up
        // Prevents showing blank screen between worker start and repository reading
        onMessage({ type: 'START' });

        const worker = new Worker(__filename, {
            workerData: {
                repository,
                configurationLocation: resolveConfigurationLocation(),
            },

            // TODO: use worker.SHARE_ENV. Figure out how to combine it with GIT_TERMINAL_PROMPT
            env: {
                // Prevent git from prompting password. Instead just fail repository cloning.
                GIT_TERMINAL_PROMPT: '0',

                // Pass CI flag to worker_threads
                CI: process.env.CI,
            },
        });

        const cleanup = workerCallback(worker);

        worker.on('message', (message: WorkerMessage) => {
            switch (message.type) {
                case 'LINT_END':
                    return resolve();

                default:
                    return onMessage(message);
            }
        });

        worker.on('error', (error: Error & { code?: string }) => {
            const messages = [
                createErrorMessage({
                    path: repository,
                    ruleId: '',
                    message: [error.code, error.message]
                        .filter(Boolean)
                        .join(' '),
                }),
            ];

            onMessage({ type: 'WORKER_ERROR', payload: error.code });
            onMessage({ type: 'ON_RESULT', payload: { messages } });
            resolve();
        });

        worker.on('exit', code => {
            cleanup();

            // 0 = success, 1 = termination
            if (code === 0 || code === 1) {
                return resolve();
            }

            const messages = [
                createErrorMessage({
                    message: `Worker exited with code ${code}`,
                    path: repository,
                    ruleId: '',
                }),
            ];

            onMessage({ type: 'ON_RESULT', payload: { messages } });
            resolve();
        });
    });
}

export default { scanRepository };
