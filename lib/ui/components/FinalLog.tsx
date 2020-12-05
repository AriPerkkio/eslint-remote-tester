import React from 'react';
import { Static, Text } from 'ink';

import ProgressLogger from '@progress-logger';
import { LogMessage } from '@progress-logger/types';
import { useExitAfterRender } from '../hooks';

const START_MESSAGE: Omit<LogMessage, 'level'> = {
    content: 'Full log:',
    color: 'yellow',
};

const NO_ERRORS_MESSAGE: Omit<LogMessage, 'level'> = {
    content: 'No errors',
    color: 'green',
};

/**
 * Final log of the scan
 * - Displayed only on CLI mode after scan has completed
 * - This is what users end up seeing after application exits.
 *   Everything else is cleared from the screen.
 */
export default function FinalLog(): JSX.Element {
    useExitAfterRender();

    const logMessages = ProgressLogger.getMessages();
    const messages = logMessages.length > 0 ? logMessages : [NO_ERRORS_MESSAGE];

    return (
        <Static items={[START_MESSAGE, ...messages]}>
            {({ color, content }, index) => (
                <Text key={index} color={color}>
                    {content}
                </Text>
            )}
        </Static>
    );
}
