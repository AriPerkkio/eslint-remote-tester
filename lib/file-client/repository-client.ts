import fs from 'fs';
import simpleGit from 'simple-git';

import { CACHE_LOCATION, URL } from './file-constants';

export interface RepositoryClientOptions {
    repository: string;
    onClone: () => void;
    onCloneFailure: () => void;
    onPull: () => void;
    onPullFailure: () => void;
}

// Clone only latest history of the main branch
const CLONE_OPTS = { '--depth': 1 } as const;
const CLONE_RETRY_TIMES = 5;

// Create cache if missing
if (!fs.existsSync(CACHE_LOCATION)) {
    fs.mkdirSync(CACHE_LOCATION);
}

/**
 * Clone or pull latest of given repository
 */
export async function cloneRepository({
    repository,
    onClone,
    onCloneFailure,
    onPull,
    onPullFailure,
}: RepositoryClientOptions): Promise<void> {
    const repoLocation = `${CACHE_LOCATION}/${repository}`;

    if (!fs.existsSync(repoLocation)) {
        onClone();

        try {
            const git = simpleGit();

            // Clone operations are often unstable. Try cloning repository 5 times before giving up.
            await retry(() =>
                git.clone(`${URL}/${repository}.git`, repoLocation, CLONE_OPTS)
            );
        } catch (e) {
            onCloneFailure();
        }
    } else {
        onPull();

        try {
            const git = simpleGit({ baseDir: repoLocation });
            await git.pull();
        } catch (e) {
            onPullFailure();
        }
    }
}

async function retry<T>(
    method: () => Promise<T>,
    times = CLONE_RETRY_TIMES
): Promise<T> {
    if (times === 0) {
        throw new Error(`Methods failed after ${CLONE_RETRY_TIMES} times`);
    }

    try {
        return await method();
    } catch (e) {
        return await retry(method, times - 1);
    }
}

/**
 * Remove repository from the cache
 */
export async function removeCachedRepository(
    repository: string
): Promise<void> {
    const repoLocation = `${CACHE_LOCATION}/${repository}`;

    if (fs.existsSync(repoLocation)) {
        fs.rmdirSync(repoLocation, { recursive: true });
    }
}
