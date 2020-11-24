import { useLayoutEffect, useState } from 'react';
import { useApp } from 'ink';

import { getResults } from '@file-client';

/**
 * Hook for exiting application and process after one final re-render
 */
export function useExitAfterRender(): void {
    const [hasRendered, setRendered] = useState(false);
    const { exit } = useApp();

    // Fire final re-render cycle
    // Some terminals do not re-run second useEffect. useLayoutEffect works.
    useLayoutEffect(() => setRendered(true), []);

    useLayoutEffect(() => {
        if (hasRendered) {
            const exitCode = getResults().length > 0 ? 1 : undefined;

            exit();
            process.exit(exitCode);
        }
    }, [hasRendered, exit]);
}
