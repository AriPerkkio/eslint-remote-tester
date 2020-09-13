const fs = require('fs');
const simpleGit = require('simple-git');
const logger = require('./process-logger');
const config = require('./config');
const git = simpleGit();

const URL = 'https://github.com';
const IGNORED_PATHS = ['.git'];
const CACHE_LOCATION = './.cache-eslint-repo-tester';
const ENCODING = 'utf8';

/**
 * Prepare cache and repository directories
 *
 * @param {String} repository Repository being scanned
 */
async function prepare(repository) {
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
 * Construct flat file tree recursively from given directory
 *
 * @param {String} dir Directory to start from
 * @returns {String[]} File paths
 */
function constructTreeFromDir(dir) {
    return fs
        .readdirSync(dir)
        .map(fileOrDir => {
            if (IGNORED_PATHS.includes(fileOrDir)) return;
            const currentPath = `${dir}/${fileOrDir}`;

            return fs.lstatSync(currentPath).isDirectory()
                ? constructTreeFromDir(currentPath)
                : currentPath;
        })
        .filter(Boolean)
        .reduce((all, current) => all.concat(current), []);
}

/**
 * Get all files from given repository matching the extensions set by configuraiton
 *
 * @param {String} repository Repository to scan
 * @returns {Promise<Array.<{ path: string, content: string }>>}
 */
async function getFiles(repository) {
    await prepare(repository);

    const paths = constructTreeFromDir(`${CACHE_LOCATION}/${repository}`);
    const files = paths
        .filter(path => config.extensions.some(ext => path.endsWith(ext)))
        .map(path => ({
            path,
            content: fs.readFileSync(path, ENCODING),
        }));

    return files;
}

module.exports = {
    getFiles,
};
