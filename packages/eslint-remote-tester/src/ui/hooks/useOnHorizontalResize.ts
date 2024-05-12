import { useEffect, useRef } from 'react';
import { useStdout } from 'ink';

/**
 * Generic hook for listening to stdout resize events
 * - Fired only when width change
 */
export default function useOnHorizontalResize(method: () => void): void {
    const { stdout } = useStdout();
    const columns = useRef(stdout ? stdout.columns : 0);

    useEffect(() => {
        function onResize() {
            const newColumns = stdout ? stdout.columns : 0;

            if (columns.current !== newColumns) {
                method();
            }
            columns.current = newColumns;
        }

        process.stdout.on('resize', onResize);
        return () => {
            process.stdout.off('resize', onResize);
        };
    }, [method, stdout]);
}
