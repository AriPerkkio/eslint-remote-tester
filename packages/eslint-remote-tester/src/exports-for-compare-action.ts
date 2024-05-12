/**
 * Undocumented private API for Github CI actions:
 * - `eslint-remote-tester-compare-action`
 * - `eslint-remote-tester-run-action`
 */
export {
    RESULT_PARSER_TO_COMPARE_TEMPLATE,
    Result,
    ComparisonResults,
} from './file-client/result-templates.js';

export {
    RESULT_COMPARISON_CACHE,
    RESULTS_COMPARISON_CACHE_LOCATION,
} from './file-client/file-constants.js';

export { default as validateConfig } from './config/validator.js';
export { loadConfig } from './config/load.js';
export { Config, ConfigToValidate } from './config/types.js';
