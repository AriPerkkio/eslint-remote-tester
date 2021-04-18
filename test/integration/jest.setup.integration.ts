import { addFailureLogger, clearResultsCache } from '../utils';

jest.setTimeout(15000);
addFailureLogger();

beforeEach(async () => {
    clearResultsCache();

    // Timeout between tests - otherwise constant `git clone` calls start failing
    await new Promise(r => setTimeout(r, 2000));
});
