import { useState, useLayoutEffect } from 'react';
import { useStdout } from 'ink';

/**
 * Subscribe to terminals height changes
 */
export function useStdoutHeight(): number {
    const { stdout } = useStdout();
    const [height, setHeight] = useState<number>(stdout ? stdout.rows : 0);

    useLayoutEffect(() => {
        function onResize() {
            if (stdout) {
                setHeight(stdout.rows);
            }
        }

        if (stdout) {
            stdout.on('resize', onResize);
            return () => {
                stdout.off('resize', onResize);
            };
        }
    }, [stdout]);

    return height;
}
