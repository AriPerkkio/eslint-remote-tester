import React from 'react';
import { Box, Text } from 'ink';

import config from '@config';
import {
    OVERFLOWING_ROWS_TOP,
    OVERFLOWING_ROWS_BOTTOM,
} from '@progress-logger';
import {
    useScannedRepositoriesCount,
    useStdoutHeight,
    useScroll,
} from '../hooks';

// Status row + empty line between tasks and messages
const CONTENT_PADDING = 2;

/**
 * Box for managing scrolling of messages
 * - Keeps track of how many messages can fit to the screen
 *   and hides the overflowing ones. Renders scroll indicators
 *   on top and bottom of the box.
 * - Scrolling is handled via `useScroll`
 * - Displayed only on CLI mode
 */
const MessagesScrollBox: React.FC = ({ children }) => {
    const terminalHeight = useStdoutHeight();
    const scannedRepositories = useScannedRepositoriesCount();

    const messages = React.Children.toArray(children);
    const repositoriesLeft = config.repositories.length - scannedRepositories;
    const tasks = Math.min(repositoriesLeft, config.concurrentTasks);

    // Height of the area reserved for messages
    const maxHeight = terminalHeight - tasks - CONTENT_PADDING;

    // Maximum amount of scroll - how far scroll can reach
    const maxScroll = messages.length - maxHeight;

    // Current scroll value
    const scrollTop = useScroll(maxScroll, maxHeight);

    const messagesOverflowing = messages.length - scrollTop > maxHeight;
    const areaHeight = messagesOverflowing ? maxHeight : undefined;

    // Display only messages which fit the scroll area
    const visibleMessages = messages.slice(scrollTop, scrollTop + maxHeight);

    // Scroll has moved - add indicator to top
    if (scrollTop) {
        visibleMessages.splice(
            0,
            1,
            <Text key='scroll-top' color='yellow' wrap='truncate-end'>
                {OVERFLOWING_ROWS_TOP(scrollTop)}
            </Text>
        );
    }

    // Messages are overflowing below the area - add indicator to bottom
    if (messagesOverflowing) {
        visibleMessages.splice(
            -1,
            1,
            <Text key='scroll-bottom' color='yellow' wrap='truncate-end'>
                {OVERFLOWING_ROWS_BOTTOM(maxScroll - scrollTop)}
            </Text>
        );
    }

    return (
        <Box
            flexDirection='column'
            marginTop={scannedRepositories > 0 ? 1 : 0}
            height={areaHeight}
        >
            {visibleMessages}
        </Box>
    );
};

export default MessagesScrollBox;
