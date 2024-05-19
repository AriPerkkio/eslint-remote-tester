import fs from 'node:fs';

import { CACHE_LOCATION } from './file-constants.js';
import {
    cloneRepository,
    type RepositoryClientOptions,
} from './repository-client.js';
import config from '../config/index.js';

export interface SourceFile {
    path: string;
}

interface FileClientOptions extends RepositoryClientOptions {
    repository: string;
    onRead: () => void;
    onReadFailure: () => void;
}

/**
 * Check whether given directory or path is set to be ignored by config
 * - Comparison is done against whole repository path: `<org>/<repository>/path/to/file.<ext>`
 */
function isDirectoryIgnored(directory: string) {
    return (
        config.pathIgnorePattern &&
        config.pathIgnorePattern.test(
            directory.replace(`${CACHE_LOCATION}/`, '')
        )
    );
}

/**
 * Check whether given file is ignored based on its size
 */
function isFileIgnored(filePath: string) {
    return fs.statSync(filePath).size > config.maxFileSizeBytes;
}

/**
 * Construct flat file tree recursively from given directory
 */
function constructTreeFromDir(dir: string): string[] {
    return fs
        .readdirSync(dir)
        .map(fileOrDir => {
            const currentPath = `${dir}/${fileOrDir}`;
            if (isDirectoryIgnored(currentPath)) return;

            const fileStats = fs.lstatSync(currentPath);

            if (fileStats.isDirectory()) {
                return constructTreeFromDir(currentPath);
            }

            if (fileStats.isFile()) {
                return currentPath;
            }

            // Ignore non-files and non-directories, e.g. symlinks
            return false;
        })
        .filter(Boolean)
        .reduce<string[]>(
            (all, current) => (current ? all.concat(current) : all),
            []
        );
}

/**
 * Get all files from given repository matching the extensions set by configuration
 */
export async function getFiles({
    repository,
    onClone,
    onCloneFailure,
    onPull,
    onPullFailure,
    onRead,
    onReadFailure,
}: FileClientOptions): Promise<SourceFile[]> {
    await cloneRepository({
        repository,
        onClone,
        onCloneFailure,
        onPull,
        onPullFailure,
    });

    onRead();
    try {
        const paths = constructTreeFromDir(`${CACHE_LOCATION}/${repository}`);

        return paths
            .filter(path => config.extensions.some(ext => path.endsWith(ext)))
            .filter(path => !isFileIgnored(path))
            .map(path => ({ path }));
    } catch (e) {
        onReadFailure();
        return [];
    }
}
