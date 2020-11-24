import React from 'react';
import { Static, Text } from 'ink';

import { getResults } from '@file-client';
import { useExitAfterRender } from '../hooks';

const START_MESSAGE = '\nResults:';
const NO_ERRORS = ['No errors'];

/**
 * Results of the scan
 * - Displayed only on CI mode after scan has completed
 */
export default function Results(): JSX.Element {
    useExitAfterRender();

    const results = getResults();
    const items: string[] = [
        START_MESSAGE,
        ...(results.length > 0 ? results : NO_ERRORS),
    ];

    return (
        <Static items={items}>
            {(result, index) => <Text key={index}>{result}</Text>}
        </Static>
    );
}
