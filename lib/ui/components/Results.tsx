import React from 'react';
import { Static, Text } from 'ink';

import {
    ResultsStore,
    RESULT_TEMPLATE,
    RESULTS_TEMPLATE_CI_BASE,
} from '@file-client';
import { useExitAfterRender } from '../hooks';

const START_MESSAGE = '\nResults:';
const NO_ERRORS = ['No errors'];

/**
 * Results of the scan
 * - Displayed only on CI mode after scan has completed
 */
export default function Results(): JSX.Element {
    useExitAfterRender();

    const results = ResultsStore.getResults();
    const formattedResults = results.map(result =>
        [RESULTS_TEMPLATE_CI_BASE(result), RESULT_TEMPLATE(result)].join('\n')
    );

    const items: string[] = [
        START_MESSAGE,
        ...(formattedResults.length > 0 ? formattedResults : NO_ERRORS),
    ];

    return (
        <Static items={items}>
            {(result, index) => <Text key={index}>{result}</Text>}
        </Static>
    );
}
