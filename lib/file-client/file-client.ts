import fs from 'fs';

import { cloneRepository, CACHE_LOCATION } from './repository-client';
import config from '../config';

export interface SourceFile {
    content: string;
    path: string;
}

interface GetFilesArguments {
    repository: string;
    onClone: () => void;
    onCloneFailure: () => void;
    onRead: () => void;
    onReadFailure: () => void;
}

/**
 * Check whether given directory or path is set to be ignored by config
 */
function isDirectoryIgnored(fileOrDir: string) {
    return config.pathIgnorePattern && config.pathIgnorePattern.test(fileOrDir);
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
        .reduce<string[]>(
            (all, current) => (current ? all.concat(current) : all),
            []
        );
}

/**
 * Get all files from given repository matching the extensions set by configuraiton
 */
export async function getFiles({
    repository,
    onClone,
    onCloneFailure,
    onRead,
    onReadFailure,
}: GetFilesArguments): Promise<SourceFile[]> {
    await cloneRepository(repository, onClone, onCloneFailure);

    onRead();
    try {
        const paths = constructTreeFromDir(`${CACHE_LOCATION}/${repository}`);

        return paths
            .filter(path => config.extensions.some(ext => path.endsWith(ext)))
            .map(path => ({
                path,
                content: fs.readFileSync(path, 'utf8'),
            }));
    } catch (e) {
        onReadFailure();
        return [];
    }
}
