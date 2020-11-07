import fs from 'fs';
import { isMainThread } from 'worker_threads';

import { CACHE_LOCATION, URL } from './repository-client';
import {
    RESULT_PARSER_TO_TEMPLATE,
    RESULT_PARSER_TO_EXTENSION,
} from './result-templates';
import config from '@config';
import { LintMessage } from '@engine/types';

const RESULTS: string[] = [];
export const RESULTS_LOCATION = './eslint-remote-tester-results';
const RESULT_TEMPLATE = RESULT_PARSER_TO_TEMPLATE[config.resultParser];
const RESULT_EXTENSION = RESULT_PARSER_TO_EXTENSION[config.resultParser];

/**
 * Initialize results folder
 * - Should be ran once from the main thread
 */
export function clearResults(): void {
    if (isMainThread) {
        if (fs.existsSync(RESULTS_LOCATION)) {
            fs.rmdirSync(RESULTS_LOCATION, { recursive: true });
        }

        fs.mkdirSync(RESULTS_LOCATION);
    }
}

const RESULT_TEMPLATE_CLI = (result: LintMessage) => {
    const path = result.path.replace(`${CACHE_LOCATION}/`, '');
    const extension = path.split('.').pop();
    const lines = result.line
        ? `#L${result.line}${result.endLine ? `-L${result.endLine}` : ''}`
        : '';

    const [project, repository, ...pathParts] = path.split('/');
    const filePath = pathParts.join('/') + lines;
    const postfix = filePath ? `/blob/HEAD/${filePath}` : '';

    return RESULT_TEMPLATE({
        rule: result.ruleId,
        message: result.message,
        path,
        link: `${URL}/${project}/${repository}${postfix}`,
        extension,
        source: result.source,
        error: result.error,
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

    // Construct result file name, e.g. mui-org_material-ui.md
    const repositoryOwnerAndName = repository.split('/').join('_');
    const fileName = `${repositoryOwnerAndName}${RESULT_EXTENSION}`;

    const formattedResults = formatResults(results, repository);
    RESULTS.push(formattedResults);

    if (!config.CI) {
        fs.writeFileSync(
            `${RESULTS_LOCATION}/${fileName}`,
            formattedResults,
            'utf8'
        );
    }
}

export function getResults(): string[] {
    return RESULTS.length > 0 ? RESULTS : ['No errors'];
}
