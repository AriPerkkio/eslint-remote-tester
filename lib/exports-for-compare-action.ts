/**
 * Undocumented private API for Github CI action eslint-remote-tester-compare-action
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
export { Config, ConfigToValidate } from '@config/types';
