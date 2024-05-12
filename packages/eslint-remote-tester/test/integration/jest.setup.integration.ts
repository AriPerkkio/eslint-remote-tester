import { clearRepositoryCache } from '../utils';

jest.setTimeout(15000);

beforeEach(async () => {
    clearRepositoryCache();

    // Timeout between tests - otherwise constant `git clone` calls start failing
    await new Promise(r => setTimeout(r, 2000));
});
