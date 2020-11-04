import fs from 'fs';

import { INTEGRATION_REPO_OWNER, INTEGRATION_REPO_NAME } from '../utils';
import { CACHE_LOCATION } from '@file-client';

// Extend timeout due to actual git clone
jest.setTimeout(5000);

beforeEach(() => {
    const repositoryCache = `${CACHE_LOCATION}/${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}`;

    if (fs.existsSync(repositoryCache)) {
        fs.rmdirSync(repositoryCache, { recursive: true });
    }
});
