import fs from 'fs';

const ROOT = '.';
const CACHE_DIR = '/.cache-eslint-remote-tester';
const NODE_MODULES = '/node_modules';
const ESLINT_REMOTE_TESTER = '/eslint-remote-tester';

function initializeCacheDirectory() {
    if (fs.existsSync(ROOT + NODE_MODULES + ESLINT_REMOTE_TESTER)) {
        // Has eslint-remote-tester installed under node_modules
        return ROOT + NODE_MODULES + ESLINT_REMOTE_TESTER + CACHE_DIR;
    }

    if (fs.existsSync(ROOT + NODE_MODULES)) {
        // Has node_modules but no eslint-remote-tester installed locally
        return ROOT + NODE_MODULES + CACHE_DIR;
    }

    // Has no node_modules
    return ROOT + CACHE_DIR;
}

/** Directory where repositories are cloned to */
export const CACHE_LOCATION = initializeCacheDirectory();

/** Directory where results are generated in to */
export const RESULTS_LOCATION = './eslint-remote-tester-results';

/** Directory name where comparison results are generated in to */
export const RESULTS_COMPARE_DIR = 'comparison-results';

/** Directory name where comparison results are generated in to */
export const RESULTS_COMPARE_LOCATION = `${RESULTS_LOCATION}/${RESULTS_COMPARE_DIR}`;

/** Cache JSON for previous scan results */
export const RESULT_COMPARISON_CACHE = '.comparison-cache.json';

/** Location for result comparison cache */
export const RESULTS_COMPARISON_CACHE_LOCATION = `${CACHE_LOCATION}/${RESULT_COMPARISON_CACHE}`;

/** Base URL for repository cloning */
export const URL = 'https://github.com';
