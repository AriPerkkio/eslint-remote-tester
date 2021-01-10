import config from '@config';
import {
    ResultsStore,
    compareResults,
    writeComparisonResults,
} from '@file-client';

/**
 * Callback invoked once scan is complete and application is about to exit
 */
export default async function onExit(): Promise<void> {
    const results = ResultsStore.getResults();
    const errors = [];

    if (config.compare) {
        try {
            const comparisonResults = compareResults(results);
            ResultsStore.setComparisonResults(comparisonResults);

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
}
