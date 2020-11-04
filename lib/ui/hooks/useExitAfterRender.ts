import { useLayoutEffect, useState } from 'react';
import { useApp } from 'ink';

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
            exit();
            process.exit();
        }
    }, [hasRendered, exit]);
}
