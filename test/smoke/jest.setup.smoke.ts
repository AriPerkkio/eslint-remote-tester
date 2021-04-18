import { addFailureLogger, clearResultsCache } from '../utils';

jest.setTimeout(120000);
addFailureLogger();

beforeEach(async () => {
    clearResultsCache();
});
