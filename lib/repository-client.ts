import fs from 'fs';
import simpleGit from 'simple-git';

import config from './config';
import { SourceFile } from './types';

interface GetFilesArguments {
    repository: string;
    onClone: () => void;
    onCloneFailure: () => void;
    onRead: () => void;
    onReadFailure: () => void;
}

const URL = 'https://github.com';
const CACHE_LOCATION = './.cache-eslint-repo-tester';
const ENCODING = 'utf8';

const git = simpleGit();
const pathIgnorePattern = config.pathIgnorePattern
    ? new RegExp(config.pathIgnorePattern)
    : undefined;

/**
 * Prepare cache and repository directories
 */
async function prepare(
    repository: string,
    onClone: GetFilesArguments['onClone'],
    onCloneFailure: GetFilesArguments['onCloneFailure']
) {
    const repoLocation = `${CACHE_LOCATION}/${repository}`;

    if (!fs.existsSync(CACHE_LOCATION)) {
        fs.mkdirSync(CACHE_LOCATION);
    }

    if (!fs.existsSync(repoLocation)) {
        onClone();
        try {
            await git.clone(`${URL}/${repository}.git`, repoLocation);
        } catch (e) {
            onCloneFailure();
        }
    }
}

/**
 * Check whether given directory or path is set to be ignored by config
 */
function isDirectoryIgnored(fileOrDir: string) {
    return pathIgnorePattern && pathIgnorePattern.test(fileOrDir);
}

/**
 * Construct flat file tree recursively from given directory
 */
function constructTreeFromDir(dir: string): string[] {
    return fs
        .readdirSync(dir)
        .map(fileOrDir => {
            if (isDirectoryIgnored(fileOrDir)) return;
            const currentPath = `${dir}/${fileOrDir}`;

            return fs.lstatSync(currentPath).isDirectory()
                ? constructTreeFromDir(currentPath)
                : currentPath;
        })
        .filter(Boolean)
        .reduce<string[]>((all, current) => all.concat(current), []);
}

/**
 * Get all files from given repository matching the extensions set by configuraiton
 */
async function getFiles({
    repository,
    onClone,
    onCloneFailure,
    onRead,
    onReadFailure,
}: GetFilesArguments): Promise<SourceFile[]> {
    await prepare(repository, onClone, onCloneFailure);

    onRead();
    try {
        const paths = constructTreeFromDir(`${CACHE_LOCATION}/${repository}`);

        return paths
            .filter(path => config.extensions.some(ext => path.endsWith(ext)))
            .map(path => ({
                path,
                content: fs.readFileSync(path, ENCODING),
            }));
    } catch (e) {
        onReadFailure();
        return [];
    }
}

export default { getFiles };
