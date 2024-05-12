import React from 'react';
import { Text } from 'ink';

import { useScannedRepositoriesCount } from '../hooks/index.js';
import { REPOSITORIES_STATUS_TEMPLATE } from '../../progress-logger/index.js';

/**
 * Status of repository scanning progress
 */
export default function Status(): JSX.Element {
    const scannedRepositories = useScannedRepositoriesCount();

    return (
        <Text wrap='truncate-middle'>
            {REPOSITORIES_STATUS_TEMPLATE(scannedRepositories)}
        </Text>
    );
}
