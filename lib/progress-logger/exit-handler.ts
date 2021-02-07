import config from '@config';
import {
    ResultsStore,
    compareResults,
    writeComparisonResults,
} from '@file-client';
import { ComparisonResults } from '@file-client/result-templates';
import { RESULT_COMPARISON_FINISHED } from './log-templates';
import { LogMessage } from './types';

/**
 * Callback invoked once scan is complete and application is about to exit
 */
export default async function onExit(): Promise<LogMessage[]> {
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
            errors.push('Error occured while generating comparison results');
            errors.push(e.stack);
        }
    }

    if (config.onComplete) {
        try {
            const onCompletePromise = config.onComplete(
                results,
                comparisonResults
            );

            if (onCompletePromise instanceof Promise) {
                await onCompletePromise;
            }
        } catch (e) {
            errors.push('Error occured while calling onComplete callback');
            errors.push(e.stack);
        }
    }

    if (errors.length) {
        throw new Error(errors.filter(Boolean).join('\n'));
    }

    return messages;
}
