/** Directory where repositories are cloned to */
export const CACHE_LOCATION = './.cache-eslint-remote-tester';

/** Directory where results are generated in to */
export const RESULTS_LOCATION = './eslint-remote-tester-results';

/** Directory name where comparison results are generated in to */
export const RESULTS_COMPARE_DIR = 'comparison-results';

/** Directory name where comparison results are generated in to */
export const RESULTS_COMPARE_LOCATION = `${RESULTS_LOCATION}/${RESULTS_COMPARE_DIR}`;

/** Cache JSON for previous scan results */
const RESULT_COMPARISON_CACHE = '.comparison-cache.json';

/** Location for result comparison cache */
export const RESULTS_COMPARISON_CACHE_LOCATION = `${CACHE_LOCATION}/${RESULT_COMPARISON_CACHE}`;

/** Base URL for repository cloning */
export const URL = 'https://github.com';
