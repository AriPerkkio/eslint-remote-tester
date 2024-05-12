/**
 * Fetch repositories depending on given project from libraries.io.
 * Unstable API of libraries.io is considered by retrying the requests and
 * caching everything. Failing script can easily be restarted and continued
 * from previous progress.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import __fetch from 'node-fetch';

import { isRepositoryPublic } from './utils';

type DependentRepository = {
    host_type: 'GitHub';
    fork: boolean;
    full_name: string;
    private: boolean;
};

const MAX_REQUEST = 100;
const ENCODING = 'utf8';
const QUERY_CACHE = resolve(`${__dirname}/.query-cache`);
const REPOSITORIES_RAW_CACHE = resolve(`${__dirname}/.repositories-raw-cache`);
const REPOSITORIES_PUBLIC_CACHE = resolve(
    `${__dirname}/.repositories-public-cache`
);
const REPOSITORIES_JSON = resolve(`${__dirname}/../src/repositories.json`);

const API_KEY = process.env.npm_config_libraries_io_api_key;
if (!API_KEY) {
    throw new Error(
        'Libraries.io api key not found from ~/.npmrc (libraries-io-api-key=<your-key>)'
    );
}

const indexOfProject = process.argv.indexOf('--project');
if (indexOfProject === -1) {
    throw new Error('--project was not given');
}
const PROJECT = process.argv[indexOfProject + 1];

// Prepare caches
if (!existsSync(QUERY_CACHE)) {
    writeFileSync(QUERY_CACHE, '{}', ENCODING);
}
if (!existsSync(REPOSITORIES_RAW_CACHE)) {
    writeFileSync(REPOSITORIES_RAW_CACHE, '[]', ENCODING);
}
if (!existsSync(REPOSITORIES_PUBLIC_CACHE)) {
    writeFileSync(REPOSITORIES_PUBLIC_CACHE, '[]', ENCODING);
}

/**
 * Attempt to fetch given URL. Retries five times when request fails.
 */
const retryFetch = async (url: string) => {
    for (let retries = 1; retries <= 5; retries++) {
        try {
            const response = await __fetch(url).catch();

            // Libraries.io's 60 request per minute limit
            if (response.status === 429) {
                console.log(
                    chalk.red('Request rate limit hit. Sleeping for 60s')
                );
                await new Promise(r => setTimeout(r, 60000));
                continue;
            }

            if (!response.ok) {
                console.log(chalk.yellow`Retrying (${retries}/5)`);
                continue;
            }

            return response;
        } catch (_) {
            continue;
        }
    }
};

/**
 * Fetch with cache. Writes successful responses into `QUERY_CACHE` in order to
 * minimize requests. API_KEY is filtered out of cached requests.
 */
const cachedFetch = async (url: string): Promise<DependentRepository[]> => {
    const cache = getCache<{ [key: string]: DependentRepository[] }>(
        QUERY_CACHE
    );
    const cacheUrl = url.replace(API_KEY, '<API_KEY>');

    if (cache[cacheUrl]) {
        console.log(chalk.green`Cache hit ${cacheUrl}`);
        return cache[cacheUrl];
    }

    console.log(chalk.yellow`Requesting ${cacheUrl}`);
    const response = await retryFetch(url);

    if (!response) {
        return [];
    }

    if (!response.ok) {
        console.log(
            chalk.red`Failed to fetch ${cacheUrl}. Response ${response.status} ${response.statusText}`
        );

        return [];
    }

    const json = await response.json();
    writeFileSync(
        QUERY_CACHE,
        JSON.stringify({ ...cache, [cacheUrl]: json }),
        ENCODING
    );

    return json;
};

const getCache = <T>(location: string): T =>
    JSON.parse(readFileSync(location, ENCODING));

const writeToArrayCache = <T>(location: string, results: T[]) => {
    const cacheContent = getCache<T[]>(location);
    const newContent = [...cacheContent, ...results].filter(
        (item, index, array) => array.indexOf(item) === index
    );

    writeFileSync(location, JSON.stringify(newContent, null, 4), ENCODING);
};

const generateDependentRepositoriesUrl = (project: string, page: number) => {
    const encodedProject = encodeURIComponent(project);

    return `https://libraries.io/api/npm/${encodedProject}/dependent_repositories?api_key=${API_KEY}&per_page=100&page=${page}`;
};

const filterRepository = ({
    host_type,
    private: isPrivate,
    fork,
}: DependentRepository) => host_type === 'GitHub' && !isPrivate && !fork;

const parseRepositoryName = ({ full_name }: DependentRepository) => full_name;

const main = async () => {
    for (let page = 1; page < MAX_REQUEST; page++) {
        const dependentRepositories = await cachedFetch(
            generateDependentRepositoriesUrl(PROJECT, page)
        );

        if (dependentRepositories.length === 0) {
            console.log(chalk.green`Stopping at page ${page}`);
            break;
        }

        const repositories = dependentRepositories
            .filter(filterRepository)
            .map(parseRepositoryName);

        writeToArrayCache(REPOSITORIES_RAW_CACHE, repositories);

        const cachedPublicRepositories = getCache<string>(
            REPOSITORIES_PUBLIC_CACHE
        );
        const newRepositories = repositories.filter(
            r => !cachedPublicRepositories.includes(r)
        );
        const publicRepositories = [];

        for (const repository of newRepositories) {
            const isPublic = await isRepositoryPublic(repository);

            if (isPublic) {
                publicRepositories.push(repository);
            }
        }

        writeToArrayCache(REPOSITORIES_PUBLIC_CACHE, publicRepositories);
    }

    writeToArrayCache(
        REPOSITORIES_JSON,
        getCache<string[]>(REPOSITORIES_PUBLIC_CACHE)
    );
};

main().catch(console.error);
