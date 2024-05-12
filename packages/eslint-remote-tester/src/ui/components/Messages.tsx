import React, { useEffect, useReducer } from 'react';
import { Text } from 'ink';

import ProgressLogger from '../../progress-logger/index.js';
import { LogMessage } from '../../progress-logger/types.js';

function reducer(messages: LogMessage[], newMessage: LogMessage) {
    return [...messages, newMessage];
}

/**
 * List of `ProgressLogger`'s messages
 * - Displayed only on CLI mode
 */
const Messages: React.FC<{ wrapper?: React.ElementType }> = ({
    wrapper: Wrapper = React.Fragment,
}) => {
    const [messages, addMessage] = useReducer(reducer, []);

    useEffect(() => {
        ProgressLogger.on('message', addMessage);
        return () => {
            ProgressLogger.off('message', addMessage);
        };
    }, []);

    return (
        <Wrapper>
            {messages.map((message, index) => (
                <Text key={index} color={message.color} wrap='truncate-end'>
                    {message.content}
                </Text>
            ))}
        </Wrapper>
    );
};

export default Messages;
