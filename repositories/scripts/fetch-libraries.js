/**
 * Fetch repositories depending on given project from libraries.io.
 * Unstable API of libraries.io is considered by retrying the requests and
 * caching everything. Failing script can easiliy be restarted and continued
 * from previous progress.
 */

const chalk = require('chalk');
const fs = require('fs');
const __fetch = require('node-fetch');
const path = require('path');

const MAX_REQUEST = 100;
const ENCODING = 'utf8';
const QUERY_CACHE = path.resolve(`${__dirname}/.query-cache`);
const REPOSITORIES_RAW_CACHE = path.resolve(
    `${__dirname}/.repositories-raw-cache`
);
const REPOSITORIES_PUBLIC_CACHE = path.resolve(
    `${__dirname}/.repositories-public-cache`
);
const REPOSITORIES_JSON = path.resolve(`${__dirname}/../repositories.json`);

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
if (!fs.existsSync(QUERY_CACHE)) {
    fs.writeFileSync(QUERY_CACHE, '{}', ENCODING);
}
if (!fs.existsSync(REPOSITORIES_RAW_CACHE)) {
    fs.writeFileSync(REPOSITORIES_RAW_CACHE, '[]', ENCODING);
}
if (!fs.existsSync(REPOSITORIES_PUBLIC_CACHE)) {
    fs.writeFileSync(REPOSITORIES_PUBLIC_CACHE, '[]', ENCODING);
}

/**
 * Attempt to fetch given URL. Retries five times when request fails.
 */
async function retryFetch(url) {
    for (let retries = 1; retries <= 5; retries++) {
        try {
            const response = await __fetch(url);

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
}

/**
 * Fetch with cache. Writes successful responses into `QUERY_CACHE` in order to
 * minimize reqests. API_KEY is filtered out of cached requests.
 */
async function cachedFetch(url) {
    const cache = getCache(QUERY_CACHE);
    const cacheUrl = url.replace(API_KEY, '<API_KEY>');

    if (cache[cacheUrl]) {
        console.log(chalk.green`Cache hit ${cacheUrl}`);
        return cache[cacheUrl];
    }

    console.log(chalk.yellow`Requesting ${cacheUrl}`);
    const response = await retryFetch(url);

    if (!response.ok) {
        return console.log(
            chalk.red`Failed to fetch ${cacheUrl}. Response ${response.status} ${response.statusText}`
        );
    }

    const json = await response.json();
    fs.writeFileSync(
        QUERY_CACHE,
        JSON.stringify({ ...cache, [cacheUrl]: json }),
        ENCODING
    );

    return json;
}

function getCache(location) {
    return JSON.parse(fs.readFileSync(location, ENCODING));
}

function writeToArrayCache(location, results) {
    const cacheContent = getCache(location);
    const newContent = [...cacheContent, ...results].filter(
        (item, index, array) => array.indexOf(item) === index
    );

    fs.writeFileSync(location, JSON.stringify(newContent, null, 2), ENCODING);
}

function generateDependentRepositoriesUrl(project, page) {
    const encodedProject = encodeURIComponent(project);

    return `https://libraries.io/api/npm/${encodedProject}/dependent_repositories?api_key=${API_KEY}&per_page=100&page=${page}`;
}

function filterRepository(repository) {
    const { host_type, private, fork } = repository;

    return host_type === 'GitHub' && !private && !fork;
}

function parseRepositoryName(repository) {
    return repository.full_name;
}

async function isRepositoryPublic(repository) {
    try {
        console.log(chalk.yellow`Requesting https://github.com/${repository}`);

        const response = await __fetch(`https://github.com/${repository}`);
        const isPublic = response.status === 200;

        if (!isPublic) {
            console.log(chalk.yellow`${repository} is private`);
        }

        return isPublic;
    } catch (_) {
        return false;
    }
}

(async function () {
    for (let page = 1; page < MAX_REQUEST; page++) {
        const dependentRepositories = await cachedFetch(
            generateDependentRepositoriesUrl(PROJECT, page)
        );

        if (!dependentRepositories) continue;

        if (!dependentRepositories.length) {
            console.log(chalk.green`Stopping at page ${page}`);
            return process.exit();
        }

        const repositories = dependentRepositories
            .filter(filterRepository)
            .map(parseRepositoryName);

        writeToArrayCache(REPOSITORIES_RAW_CACHE, repositories);

        const cachedPublicRepositories = getCache(REPOSITORIES_PUBLIC_CACHE);
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

    writeToArrayCache(REPOSITORIES_JSON, getCache(REPOSITORIES_PUBLIC_CACHE));
})();
