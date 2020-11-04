import { useReducer, useEffect } from 'react';

import ProgressLogger from '@progress-logger';
import { Task } from '@progress-logger/types';

/**
 * Subscribe to count of scanned repositories
 */
export function useScannedRepositoriesCount(): number {
    const [count, increase] = useReducer(s => s + 1, 0);

    useEffect(() => {
        function onTaskUpdate(_: Task, done?: boolean) {
            if (done) {
                increase();
            }
        }

        ProgressLogger.on('task', onTaskUpdate);
        return () => {
            ProgressLogger.off('task', onTaskUpdate);
        };
    }, []);

    return count;
}
