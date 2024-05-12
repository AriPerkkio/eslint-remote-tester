import config from '../config/index.js';
import {
    ResultsStore,
    compareResults,
    writeComparisonResults,
} from '../file-client/index.js';
import { ComparisonResults } from '../file-client/result-templates.js';
import { RESULT_COMPARISON_FINISHED } from './log-templates.js';
import { type LogMessage } from './types.js';

/**
 * Callback invoked once scan is complete and application is about to exit
 */
export default async function onExit(
    scannedRepositories: number
): Promise<LogMessage[]> {
    const messages: LogMessage[] = [];
    const errors = [];

    const results = ResultsStore.getResults();
    let comparisonResults: ComparisonResults | null = null;

    if (config.compare) {
        try {
            comparisonResults = await compareResults(results);
            ResultsStore.setComparisonResults(comparisonResults);

            messages.push({
                content: RESULT_COMPARISON_FINISHED(
                    comparisonResults.added.length,
                    comparisonResults.removed.length
                ),
                color: 'green',
                level: 'verbose',
            });

            await writeComparisonResults(comparisonResults, results);
        } catch (e) {
            errors.push('Error occurred while generating comparison results');
            errors.push(e.stack);
        }
    }

    if (config.onComplete) {
        try {
            const onCompletePromise = config.onComplete(
                results,
                comparisonResults,
                scannedRepositories
            );

            if (onCompletePromise instanceof Promise) {
                await onCompletePromise;
            }
        } catch (e) {
            errors.push('Error occurred while calling onComplete callback');
            errors.push(e.stack);
        }
    }

    if (errors.length) {
        throw new Error(errors.filter(Boolean).join('\n'));
    }

    return messages;
}
