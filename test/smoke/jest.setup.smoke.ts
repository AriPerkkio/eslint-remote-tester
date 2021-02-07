import { clearResultsCache } from '../utils';

jest.setTimeout(120000);

beforeEach(() => {
    clearResultsCache();
});
