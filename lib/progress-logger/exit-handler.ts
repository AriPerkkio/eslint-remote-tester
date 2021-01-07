import config from '@config';
import { ResultsStore } from '@file-client';

/**
 * Callback invoked once scan is complete and application is about to exit
 */
export default async function onExit(): Promise<void> {
    const errors = [];

    if (config.onComplete) {
        const results = ResultsStore.getResults();
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
