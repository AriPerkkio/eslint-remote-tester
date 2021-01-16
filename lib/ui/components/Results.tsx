import React from 'react';
import { Static, Text, Box } from 'ink';

import {
    ResultsStore,
    RESULT_TEMPLATE,
    RESULTS_TEMPLATE_CI_BASE,
    RESULT_COMPARISON_TEMPLATE,
} from '@file-client';
import { ComparisonResults } from '@file-client/result-templates';
import { useExitAfterRender } from '../hooks';

const START_MESSAGE = '\nResults:';
const NO_ERRORS = ['No errors'];

// This is used to override ink's text wrapping. Especially on Github CI the max
// line width is not really the terminals width. The CI will handle text wrapping.
const LINE_WIDTH = 500;

function formatComparisonResults(
    comparisonResults: ComparisonResults | null
): string[] {
    if (!comparisonResults) return [];
    const { added, removed } = comparisonResults;

    return [
        '\nComparison results:',
        RESULT_COMPARISON_TEMPLATE('added', added),
        ' ', // Line break
        RESULT_COMPARISON_TEMPLATE('removed', removed),
    ];
}

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

    const comparisonResults = ResultsStore.getComparisonResults();
    const formattedComparisonResults = formatComparisonResults(
        comparisonResults
    );

    const items: string[] = [
        ...formattedComparisonResults,
        START_MESSAGE,
        ...(formattedResults.length > 0 ? formattedResults : NO_ERRORS),
    ].filter(Boolean);

    return (
        <Static items={items}>
            {(result, index) => (
                <Box width={LINE_WIDTH} key={index}>
                    <Text>{result}</Text>
                </Box>
            )}
        </Static>
    );
}
