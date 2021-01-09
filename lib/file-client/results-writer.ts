import fs from 'fs';
import { isMainThread } from 'worker_threads';

import ResultsStore from './results-store';
import {
    CACHE_LOCATION,
    RESULTS_COMPARE_LOCATION,
    RESULTS_LOCATION,
    URL,
} from './file-constants';
import {
    RESULT_PARSER_TO_TEMPLATE,
    RESULT_PARSER_TO_EXTENSION,
    Result,
} from './result-templates';
import config from '@config';
import { LintMessage } from '@engine/types';

export const RESULT_TEMPLATE = RESULT_PARSER_TO_TEMPLATE[config.resultParser];
const RESULT_EXTENSION = RESULT_PARSER_TO_EXTENSION[config.resultParser];

/**
 * Initialize results and comparison directories
 * - Should be ran once from the main thread
 */
export function prepareResultsDirectory(): void {
    if (isMainThread) {
        if (fs.existsSync(RESULTS_LOCATION)) {
            fs.rmdirSync(RESULTS_LOCATION, { recursive: true });
        }

        fs.mkdirSync(RESULTS_LOCATION);
        fs.mkdirSync(RESULTS_COMPARE_LOCATION);
    }
}

function parseMessages(messages: LintMessage[]): Result[] {
    return messages.map(result => {
        const path = result.path.replace(`${CACHE_LOCATION}/`, '');
        const extension = path.split('.').pop();
        const lines = result.line
            ? `#L${result.line}${result.endLine ? `-L${result.endLine}` : ''}`
            : '';

        const [repositoryOwner, repository, ...pathParts] = path.split('/');
        const filePath = pathParts.join('/') + lines;
        const postfix = filePath ? `/blob/HEAD/${filePath}` : '';

        return {
            repository,
            repositoryOwner,
            rule: result.ruleId,
            message: result.message,
            path,
            link: `${URL}/${repositoryOwner}/${repository}${postfix}`,
            extension,
            source: result.source,
            error: result.error,
        };
    });
}

/**
 * Write results to file at `./eslint-remote-tester-results`
 */
export function writeResults(
    messages: LintMessage[],
    repository: string
): void {
    // Don't write empty files for completely valid results
    if (!messages.length) {
        return;
    }

    const results = parseMessages(messages);
    ResultsStore.addResults(...results);

    if (!config.CI) {
        // Construct result file name, e.g. mui-org_material-ui.md
        const repositoryOwnerAndName = repository.split('/').join('_');
        const fileName = `${repositoryOwnerAndName}${RESULT_EXTENSION}`;
        const formattedResults = results.map(RESULT_TEMPLATE).join('\n');

        fs.writeFileSync(
            `${RESULTS_LOCATION}/${fileName}`,
            formattedResults,
            'utf8'
        );
    }
}
