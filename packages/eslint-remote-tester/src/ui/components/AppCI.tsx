import React, { useLayoutEffect } from 'react';
import { useStdout } from 'ink';

import Results from './Results.js';
import { useOnExit } from '../hooks/index.js';
import ProgressLogger, {
    resolveColor,
    TASK_TEMPLATE,
} from '../../progress-logger/index.js';
import { type LogMessage, type Task } from '../../progress-logger/types.js';

/**
 * Application for CIs
 * - Message and task updates are rendered directly to stdout due to ink not
 *   updating CIs actively. Only final render is printed -> `<Results />`
 * - CI keep-alive messages are printed in order to avoid CIs timing out
 */
export default function AppCI(): JSX.Element {
    const done = useOnExit();
    const { write } = useStdout();

    // useLayoutEffect instead of useEffect in order to capture first tasks and messages
    useLayoutEffect(() => {
        function onMessage(message: LogMessage) {
            const color = resolveColor(message);
            write(color(`${message.content}\n`));
        }

        function onTask(task: Task) {
            // Exclude verbose lint progress updates
            if (task.step !== 'LINT' || task.currentFileIndex === 0) {
                const color = resolveColor(task);
                write(color(`${TASK_TEMPLATE(task)}\n`));
            }
        }

        ProgressLogger.on('message', onMessage)
            .on('task', onTask)
            .on('ciKeepAlive', write);

        return () => {
            ProgressLogger.off('message', onMessage)
                .off('task', onTask)
                .off('ciKeepAlive', write);
        };
    }, [write]);

    return <>{done && <Results />}</>;
}
