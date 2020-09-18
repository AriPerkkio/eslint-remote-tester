import fs from 'fs';
import simpleGit from 'simple-git';

import logger from './process-logger';
import config from './config';
import { SourceFile } from './types';
const git = simpleGit();

const URL = 'https://github.com';
const CACHE_LOCATION = './.cache-eslint-repo-tester';
const ENCODING = 'utf8';

const pathIgnorePattern = config.pathIgnorePattern
    ? new RegExp(config.pathIgnorePattern)
    : undefined;

/**
 * Prepare cache and repository directories
 */
async function prepare(repository: string) {
    const repoLocation = `${CACHE_LOCATION}/${repository}`;

    if (!fs.existsSync(CACHE_LOCATION)) {
        fs.mkdirSync(CACHE_LOCATION);
    }

    if (!fs.existsSync(repoLocation)) {
        logger.onRepositoryClone(repository);
        await git.clone(`${URL}/${repository}.git`, repoLocation);
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
async function getFiles(repository: string): Promise<SourceFile[]> {
    await prepare(repository);
    logger.onRepositoryRead(repository);

    const paths = await new Promise<string[]>(r => {
        r(constructTreeFromDir(`${CACHE_LOCATION}/${repository}`));
    });
    const files = paths
        .filter(path => config.extensions.some(ext => path.endsWith(ext)))
        .map(path => ({
            path,
            content: fs.readFileSync(path, ENCODING),
        }));

    return files;
}

export default { getFiles };
