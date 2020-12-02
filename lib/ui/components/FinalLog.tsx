import React from 'react';
import { Static, Text } from 'ink';

import ProgressLogger from '@progress-logger';
import { LogMessage } from '@progress-logger/types';
import { useExitAfterRender } from '../hooks';

const START_MESSAGE: Omit<LogMessage, 'level'> = {
    content: 'Full log:',
    color: 'yellow',
};

/**
 * Final log of the scan
 * - Displayed only on CLI mode after scan has completed
 * - This is what users end up seeing after application exits.
 *   Everything else is cleared from the screen.
 */
export default function FinalLog(): JSX.Element {
    useExitAfterRender();

    return (
        <Static items={[START_MESSAGE, ...ProgressLogger.messages]}>
            {({ color, content }, index) => (
                <Text key={index} color={color}>
                    {content}
                </Text>
            )}
        </Static>
    );
}
