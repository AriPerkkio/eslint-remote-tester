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

/**
 * Compare two sets of `Result`s and get diff of changes
 * - `added`: results which were present in previous scan but not in the current
 * - `removed`: results which are present in current scan but not in the previous
 */
export function compareResults(current: Result[]): ComparisonResults {
    const added: Result[] = [];
    const removed: Result[] = [];

    const previous = readCache();
    const all = [...current, ...previous];

    for (const result of all) {
        const matcher = (r: Result) => equals(result, r);
        const isInCurrent = current.find(matcher);
        const isInPrevious = previous.find(matcher);

        if (isInCurrent && !isInPrevious) {
            added.push(result);
        } else if (isInPrevious && !isInCurrent) {
            removed.push(result);
        }
    }

    return { added, removed };
}

/**
 * Write comparison results to file system and update cache with current results
 */
export function writeComparisonResults(
    comparisonResults: ComparisonResults,
    currentScanResults: Result[]
): void {
    writeComparisons(comparisonResults);
    updateCache(currentScanResults);
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
    const TEMPLATE = RESULT_PARSER_TO_COMPARE_TEMPLATE[config.resultParser];
    const EXTENSION = RESULT_PARSER_TO_EXTENSION[config.resultParser];

    // Directory should always be available but let's handle condition where
    // user intentionally removes it during scan.
    if (!fs.existsSync(RESULTS_COMPARE_LOCATION)) {
        fs.mkdirSync(RESULTS_COMPARE_LOCATION, { recursive: true });
    }

    for (const type of ComparisonTypes) {
        const results = comparisonResults[type];

        if (results.length) {
            const filename = `${type}${EXTENSION}`;
            const content = TEMPLATE(type, results);

            fs.writeFileSync(
                `${RESULTS_COMPARE_LOCATION}/${filename}`,
                content,
                'utf8'
            );
        }
    }
}

function equals(a: Result, b: Result): boolean {
    return (
        // Link contains path, extension, repository and repositoryOwner
        a.link === b.link &&
        a.rule === b.rule &&
        a.message === b.message &&
        a.source === b.source &&
        a.error === b.error
    );
}
