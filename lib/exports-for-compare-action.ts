/**
 * Undocumented private API for Github CI actions:
 * - `eslint-remote-tester-compare-action`
 * - `eslint-remote-tester-run-action`
 */
export {
    RESULT_PARSER_TO_COMPARE_TEMPLATE,
    Result,
    ComparisonResults,
} from '@file-client/result-templates';

export {
    RESULT_COMPARISON_CACHE,
    RESULTS_COMPARISON_CACHE_LOCATION,
} from '@file-client/file-constants';

export { default as validateConfig } from '@config/validator';
export { loadConfig } from '@config/load';
export { Config, ConfigToValidate } from '@config/types';
