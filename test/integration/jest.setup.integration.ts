import { clearResultsCache } from '../utils';

// Extend timeout due to actual git clone
jest.setTimeout(15000);

beforeEach(() => {
    clearResultsCache();
});
