import fs from 'fs';

import {
    waitFor,
    INTEGRATION_REPO_OWNER,
    INTEGRATION_REPO_NAME,
    getExitCalls,
} from '../utils';
import { CACHE_LOCATION } from '@file-client';

// Extend timeout due to actual git clone
jest.setTimeout(5000);

const isWatchMode = process.argv.find(arg => arg === '--watch');

beforeAll(() => {
    if (isWatchMode) {
        require('child_process').execSync('yarn build');
    }
});

beforeEach(() => {
    const repositoryCache = `${CACHE_LOCATION}/${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}`;

    if (fs.existsSync(repositoryCache)) {
        fs.rmdirSync(repositoryCache, { recursive: true });
    }
});

afterEach(async () => {
    await waitFor(() => getExitCalls().length > 0);
});
