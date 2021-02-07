import fs from 'fs';

import {
    RESULTS_COMPARISON_CACHE_LOCATION,
    RESULTS_COMPARE_LOCATION,
} from './file-constants';
import {
    RESULT_PARSER_TO_COMPARE_TEMPLATE,
    RESULT_PARSER_TO_EXTENSION,
    Result,
    ComparisonTypes,
    ComparisonResults,
} from './result-templates';
import config from '@config';

export const RESULT_COMPARISON_TEMPLATE =
    RESULT_PARSER_TO_COMPARE_TEMPLATE[config.resultParser];
const EXTENSION = RESULT_PARSER_TO_EXTENSION[config.resultParser];

/**
 * Compare two sets of `Result`s and get diff of changes
 * - `added`: results which were present in previous scan but not in the current
 * - `removed`: results which are present in current scan but not in the previous
 */
export function compareResults(current: Result[]): ComparisonResults {
    const previous = readCache();

    if (previous.length === 0) {
        // All results are new
        return { added: current, removed: [] };
    }

    // Using Map instead of arrays for comparison is faster: with ~500Mb JSON 20min vs 2s
    const mapCurrent = initializeMap(current);
    const mapPrevious = initializeMap(previous);

    function generatePredicate(resultsMap: ReturnType<typeof initializeMap>) {
        return function predicate(result: Result) {
            return !resultsMap.has(result.__internalHash);
        };
    }

    return {
        added: current.filter(generatePredicate(mapPrevious)),
        removed: previous.filter(generatePredicate(mapCurrent)),
    };
}

/**
 * Write comparison results to file system and update cache with current results
 */
export function writeComparisonResults(
    comparisonResults: ComparisonResults,
    currentScanResults: Result[]
): void {
    writeComparisons(comparisonResults);

    if (config.updateComparisonReference) {
        updateCache(currentScanResults);
    }
}

function readCache(): Result[] {
    if (!fs.existsSync(RESULTS_COMPARISON_CACHE_LOCATION)) {
        return [];
    }

    const cache = fs.readFileSync(RESULTS_COMPARISON_CACHE_LOCATION, 'utf8');
    return JSON.parse(cache);
}

function updateCache(currentScanResults: Result[]): void {
    if (fs.existsSync(RESULTS_COMPARISON_CACHE_LOCATION)) {
        fs.unlinkSync(RESULTS_COMPARISON_CACHE_LOCATION);
    }

    fs.writeFileSync(
        RESULTS_COMPARISON_CACHE_LOCATION,
        JSON.stringify(currentScanResults),
        'utf8'
    );
}

function writeComparisons(comparisonResults: ComparisonResults): void {
    // Directory should always be available but let's handle condition where
    // user intentionally removes it during scan.
    if (!fs.existsSync(RESULTS_COMPARE_LOCATION)) {
        fs.mkdirSync(RESULTS_COMPARE_LOCATION, { recursive: true });
    }

    for (const type of ComparisonTypes) {
        const results = comparisonResults[type];

        if (results.length) {
            const filename = `${type}${EXTENSION}`;
            const content = RESULT_COMPARISON_TEMPLATE(type, results);

            fs.writeFileSync(
                `${RESULTS_COMPARE_LOCATION}/${filename}`,
                content,
                'utf8'
            );
        }
    }
}

/**
 * Create map of `result._internalHash`'s
 */
function initializeMap(
    results: Result[]
): Map<Result['__internalHash'], boolean> {
    const map = new Map<Result['__internalHash'], boolean>();

    for (const key of results.map(c => c.__internalHash)) {
        map.set(key, true);
    }

    return map;
}
