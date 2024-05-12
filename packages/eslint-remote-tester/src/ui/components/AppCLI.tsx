import React from 'react';
import { Newline, Text } from 'ink';

import Status from './Status';
import Tasks from './Tasks';
import Messages from './Messages';
import MessagesScrollBox from './MessagesScrollBox';
import FinalLog from './FinalLog';
import { useOnExit } from '../hooks';
import useOnHorizontalResize from '../hooks/useOnHorizontalResize';

/**
 * Application for CLIs
 */
const AppCLI: React.FC<{ isTTY: boolean }> = ({ isTTY }) => {
    const done = useOnExit();

    // Clear screen completely on horizontal resize
    // Otherwise parts of old renders are displayed on top of app
    useOnHorizontalResize(console.clear);

    if (done) {
        return <FinalLog />;
    }

    // Scrollbox can only be rendered in TTY
    const wrapper = isTTY ? MessagesScrollBox : undefined;

    return (
        <>
            {!isTTY && (
                <Text color='red'>
                    Terminal is not detected as TTY. Scrollbox is disabled.
                    <Newline />
                </Text>
            )}

            <Status />
            <Tasks />
            {!isTTY && <Text>{/* Spacer */}</Text>}
            <Messages wrapper={wrapper} />
        </>
    );
};

export default AppCLI;
