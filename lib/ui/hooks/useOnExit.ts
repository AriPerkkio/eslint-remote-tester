import { useEffect, useReducer } from 'react';

import ProgressLogger from '@progress-logger';

/**
 * Subscribe to `exit` event of `ProgressLogger`
 */
export function useOnExit(): boolean {
    const [done, setDone] = useReducer(() => true, false);

    useEffect(() => {
        function onExit() {
            setDone();
        }

        ProgressLogger.on('exit', onExit);
        return () => {
            ProgressLogger.off('exit', onExit);
        };
    }, []);

    return done;
}
