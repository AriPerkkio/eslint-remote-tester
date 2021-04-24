import { addFailureLogger, clearResultsCache } from '../utils';

jest.setTimeout(300000);
addFailureLogger();

beforeEach(async () => {
    clearResultsCache();
});
