import config from '@config';
import {
    ResultsStore,
    compareResults,
    writeComparisonResults,
} from '@file-client';
import { RESULT_COMPARISON_FINISHED } from './log-templates';
import { LogMessage } from './types';

/**
 * Callback invoked once scan is complete and application is about to exit
 */
export default async function onExit(): Promise<LogMessage[]> {
    const messages: LogMessage[] = [];
    const results = ResultsStore.getResults();
    const errors = [];

    if (config.compare) {
        try {
            const comparisonResults = compareResults(results);
            ResultsStore.setComparisonResults(comparisonResults);

            messages.push({
                content: RESULT_COMPARISON_FINISHED(
                    comparisonResults.added.length,
                    comparisonResults.removed.length
                ),
                color: 'green',
                level: 'verbose',
            });

            writeComparisonResults(comparisonResults, results);
        } catch (e) {
            errors.push('Error occured while generating comparison results');
            errors.push(e.stack);
        }
    }

    if (config.onComplete) {
        try {
            const onCompletePromise = config.onComplete(results);

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
