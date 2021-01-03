import React, { useRef, useEffect, useReducer } from 'react';
import { Text } from 'ink';

import ProgressLogger, { TASK_TEMPLATE } from '@progress-logger';
import { Task } from '@progress-logger/types';

// 200ms provides smooth enough experience without throttling worst terminals.
// Modern terminals could handle updates real-time but let's support olders ones too.
export const REFRESH_INTERVAL_MS = 200;

/**
 * Currently active tasks of the scan
 * - Due to high frequency of `ProgressLogger`'s `task` events re-renders are
 *   limited by `REFRESH_INTERVAL_MS`.
 * - Displayed only on CLI mode
 */
export default function Tasks(): JSX.Element {
    const tasks = useRef<Task[]>([]);
    const tasksChanged = useRef<boolean>(false);
    const [, render] = useReducer(s => s + 1, 0);

    useEffect(() => {
        // Render only if tasks have changed
        const timerHandle = setInterval(() => {
            if (tasksChanged.current) {
                tasksChanged.current = false;
                render();
            }
        }, REFRESH_INTERVAL_MS);

        return () => clearInterval(timerHandle);
    }, []);

    useEffect(() => {
        const onTaskUpdate = (task: Task, done?: boolean) => {
            tasksChanged.current = true;

            const index = tasks.current.findIndex(
                t => t.repository === task.repository
            );

            if (done) {
                tasks.current.splice(index, 1);
            } else if (index !== -1) {
                tasks.current[index] = task;
            } else {
                tasks.current.push(task);
            }
        };

        ProgressLogger.on('task', onTaskUpdate);
        return () => {
            ProgressLogger.off('task', onTaskUpdate);
        };
    }, []);

    return (
        <>
            {tasks.current.map(task => (
                <Text
                    key={task.repository}
                    color={task.color}
                    wrap='truncate-middle'
                >
                    {TASK_TEMPLATE(task)}
                </Text>
            ))}
        </>
    );
}
