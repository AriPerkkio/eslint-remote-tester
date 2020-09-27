import { Worker, isMainThread } from 'worker_threads';

import workerTask, { WorkerMessage } from './worker-task';
import { LintMessage } from './types';

if (!isMainThread) {
    workerTask();
}

/**
 * Start scanning of given repository in a separate thread
 * - Keeps progress-logger up-to-date via onMessage
 */
function scanRepository(
    repository: string,
    onMessage: (message: WorkerMessage) => void
): Promise<LintMessage[]> {
    return new Promise((resolve, reject) => {
        // Notify about worker starting. It can take a while to get worker starting up
        // Prevents showing blank screen between worker start and repository reading
        onMessage({ type: 'START' });

        const worker = new Worker(__filename, { workerData: repository });

        worker.on('message', (message: WorkerMessage) => {
            switch (message.type) {
                case 'LINT_END':
                    return resolve(message.payload);

                default:
                    return onMessage(message);
            }
        });

        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

export default { scanRepository };
