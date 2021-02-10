import { clearResultsCache } from '../utils';

// Extend timeout due to actual git clone
jest.setTimeout(15000);

beforeEach(async () => {
    clearResultsCache();

    // Timeout between tests - otherwise constant `git clone` calls start failing
    await new Promise(r => setTimeout(r, 2000));
});
