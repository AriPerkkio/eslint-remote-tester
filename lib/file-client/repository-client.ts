import fs from 'fs';
import simpleGit from 'simple-git';

const URL = 'https://github.com';
export const CACHE_LOCATION = './.cache-eslint-repo-tester';

// Create cache if missing
if (!fs.existsSync(CACHE_LOCATION)) {
    fs.mkdirSync(CACHE_LOCATION);
}

/**
 * Clone given repository if it doesn't exist in cache yet
 */
export async function cloneRepository(
    repository: string,
    onClone: () => void,
    onCloneFailure: () => void
): Promise<void> {
    const repoLocation = `${CACHE_LOCATION}/${repository}`;

    if (!fs.existsSync(repoLocation)) {
        onClone();

        try {
            const git = simpleGit();
            await git.clone(`${URL}/${repository}.git`, repoLocation);
        } catch (e) {
            onCloneFailure();
        }
    }
    // TODO: else: git pull
}
