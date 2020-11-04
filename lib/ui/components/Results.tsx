import React from 'react';
import { Static, Text } from 'ink';

import { getResults } from '@file-client';
import { useExitAfterRender } from '../hooks';

const START_MESSAGE = '\nResults:';

/**
 * Results of the scan
 * - Displayed only on CI mode after scan has completed
 */
export default function Results(): JSX.Element {
    useExitAfterRender();

    const items: string[] = [START_MESSAGE, ...getResults()];

    return (
        <Static items={items}>
            {(result, index) => <Text key={index}>{result}</Text>}
        </Static>
    );
}
