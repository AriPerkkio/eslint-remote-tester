import React from 'react';
import { Text } from 'ink';

import { useScannedRepositoriesCount } from '../hooks';
import { REPOSITORIES_STATUS_TEMPLATE } from '@progress-logger';

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
