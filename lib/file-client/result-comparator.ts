import fs from 'fs';
import * as JSONStream from 'JSONStream';

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
export async function compareResults(
    current: Result[]
): Promise<ComparisonResults> {
    const previous = await readCache();

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
export async function writeComparisonResults(
    comparisonResults: ComparisonResults,
    currentScanResults: Result[]
): Promise<void> {
    await writeComparisons(comparisonResults);

    if (config.updateComparisonReference) {
        await updateCache(currentScanResults);
    }
}

async function readCache(): Promise<Result[]> {
    if (!fs.existsSync(RESULTS_COMPARISON_CACHE_LOCATION)) {
        return [];
    }

    const results: Result[] = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream(RESULTS_COMPARISON_CACHE_LOCATION, {
            encoding: 'utf8',
        })
            .pipe(JSONStream.parse('*'))
            .on('data', result => results.push(result))
            .on('end', resolve)
            .on('error', reject);
    });

    return results;
}

async function updateCache(currentScanResults: Result[]): Promise<void> {
    if (fs.existsSync(RESULTS_COMPARISON_CACHE_LOCATION)) {
        fs.unlinkSync(RESULTS_COMPARISON_CACHE_LOCATION);
    }

    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(RESULTS_COMPARISON_CACHE_LOCATION);
        const jstream = JSONStream.stringify()
            .pipe(stream)
            .on('finish', resolve)
            .on('error', reject);

        const copy = [...currentScanResults];
        while (copy.length > 0) {
            const chunk = copy.splice(0, 200);
            jstream.write(JSON.stringify(chunk));
        }
        jstream.end();
        stream.end();
    });
}

async function writeComparisons(
    comparisonResults: ComparisonResults
): Promise<void> {
    // Directory should always be available but let's handle condition where
    // user intentionally removes it during scan.
    if (!fs.existsSync(RESULTS_COMPARE_LOCATION)) {
        fs.mkdirSync(RESULTS_COMPARE_LOCATION, { recursive: true });
    }

    for (const type of ComparisonTypes) {
        const results = [...comparisonResults[type]];
        if (!results.length) continue;

        await new Promise((resolve, reject) => {
            const stream = fs
                .createWriteStream(
                    `${RESULTS_COMPARE_LOCATION}/${type}${EXTENSION}`,
                    { encoding: 'utf8' }
                )
                .on('finish', resolve)
                .on('error', reject);

            stream.write(RESULT_COMPARISON_TEMPLATE.header(type));
            stream.write('\n');

            while (results.length > 0) {
                const chunk = results
                    .splice(0, 200)
                    .map(RESULT_COMPARISON_TEMPLATE.results)
                    .join('\n');
                stream.write(chunk);
            }

            stream.end();
        });
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
