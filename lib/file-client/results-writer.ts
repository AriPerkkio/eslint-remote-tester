import fs from 'fs';

import config from '../config';
import { CACHE_LOCATION, URL } from './repository-client';
import {
    RESULT_PARSER_TO_TEMPLATE,
    RESULT_PARSER_TO_EXTENSION,
} from './result-templates';
import { LintMessage } from '../engine/types';

const RESULTS_CI: string[] = [];
const RESULTS_LOCATION = './results';
const RESULT_TEMPLATE = RESULT_PARSER_TO_TEMPLATE[config.resultParser];
const RESULT_EXTENSION = RESULT_PARSER_TO_EXTENSION[config.resultParser];

/**
 * Initialize results folder
 * - Should be ran once from the main thread
 */
export function clearResults(): void {
    if (fs.existsSync(RESULTS_LOCATION)) {
        fs.rmdirSync(RESULTS_LOCATION, { recursive: true });
    }

    fs.mkdirSync(RESULTS_LOCATION);
}

const RESULT_TEMPLATE_CLI = (result: LintMessage) => {
    const path = result.path.replace(`${CACHE_LOCATION}/`, '');
    const extension = path.split('.').pop();
    const lines = `#L${result.line}${
        result.endLine ? `-L${result.endLine}` : ''
    }`;

    const [project, repository, ...pathParts] = path.split('/');
    const filePath = pathParts.join('/');

    return RESULT_TEMPLATE({
        rule: result.ruleId,
        message: result.message,
        path,
        link: `${URL}/${project}/${repository}/blob/HEAD/${filePath}${lines}`,
        extension,
        source: result.source,
    });
};

const RESULT_TEMPLATE_CI = (results: string, repository: string) =>
    `Repository: ${repository}
${results}`;

function formatResults(results: LintMessage[], repository: string) {
    const formattedResults = results.map(RESULT_TEMPLATE_CLI).join('\n');

    if (config.CI) {
        return RESULT_TEMPLATE_CI(formattedResults, repository);
    }

    return formattedResults;
}

/**
 * Write results to file at `./results`
 */
export function writeResults(results: LintMessage[], repository: string): void {
    // Don't write empty files for completely valid results
    if (!results.length) {
        return;
    }
    const [, repositoryName] = repository.split('/');
    const formattedResults = formatResults(results, repository);

    if (config.CI) {
        RESULTS_CI.push(formattedResults);
    } else {
        fs.writeFileSync(
            `${RESULTS_LOCATION}/${repositoryName}${RESULT_EXTENSION}`,
            formattedResults,
            'utf8'
        );
    }
}

/**
 * Print results and exit with error code if any errors exist
 */
export function printResultsCI(): void {
    if (RESULTS_CI.length) {
        // TODO: Add support for custom onExit hook for CIs
        // e.g. "onExit": function(results) { ... }
        console.log(RESULTS_CI.join('\n'));

        process.exit(1);
    } else {
        console.log('No errors');
    }
}
