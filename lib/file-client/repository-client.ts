import fs from 'fs';
import simpleGit from 'simple-git';

import { CACHE_LOCATION, URL } from './file-constants';
import config from '@config';

export interface RepositoryClientOptions {
    repository: string;
    onClone: () => void;
    onCloneFailure: () => void;
    onPull: () => void;
    onPullFailure: () => void;
}

// Clone only latest history of the main branch
const CLONE_OPTS = { '--depth': 1 } as const;

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
            await git.clone(
                `${URL}/${repository}.git`,
                repoLocation,
                CLONE_OPTS
            );
        } catch (e) {
            onCloneFailure();
        }
    } else {
        // Cached repositories should not be updated when in comparison mode
        if (config.compare) return;

        onPull();

        try {
            const git = simpleGit({ baseDir: repoLocation });
            await git.pull();
        } catch (e) {
            onPullFailure();
        }
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
