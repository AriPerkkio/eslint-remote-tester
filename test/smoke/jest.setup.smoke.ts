import { addFailureLogger, clearRepositoryCache } from '../utils';

jest.setTimeout(300000);
addFailureLogger();

beforeEach(async () => {
    clearRepositoryCache();
});
