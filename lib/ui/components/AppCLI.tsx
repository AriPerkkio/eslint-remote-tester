import React from 'react';

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
export default function AppCLI(): JSX.Element {
    const done = useOnExit();

    // Clear screen completely on horizontal resize
    // Otherwise parts of old renders are displayed on top of app
    useOnHorizontalResize(console.clear);

    if (done) {
        return <FinalLog />;
    }

    return (
        <>
            <Status />
            <Tasks />
            <Messages wrapper={MessagesScrollBox} />
        </>
    );
}
