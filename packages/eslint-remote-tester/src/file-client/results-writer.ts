import fs from 'node:fs';
import { isMainThread } from 'node:worker_threads';
import objectHash from 'object-hash';

import ResultsStore from './results-store.js';
import { removeDirectorySync } from './file-utils.js';
import {
    CACHE_LOCATION,
    RESULTS_COMPARE_LOCATION,
    RESULTS_LOCATION,
    URL,
} from './file-constants.js';
import {
    RESULT_PARSER_TO_TEMPLATE,
    RESULT_PARSER_TO_EXTENSION,
    Result,
} from './result-templates.js';
import config from '../config/index.js';
import { LintMessage } from '../engine/types.js';

export const RESULT_TEMPLATE = RESULT_PARSER_TO_TEMPLATE[config.resultParser];
const RESULT_EXTENSION = RESULT_PARSER_TO_EXTENSION[config.resultParser];

/**
 * Initialize results and comparison directories
 * - Should be ran once from the main thread
 */
export function prepareResultsDirectory(): void {
    if (isMainThread) {
        if (fs.existsSync(RESULTS_LOCATION)) {
            removeDirectorySync(RESULTS_LOCATION);
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

        const resultWithoutHash: Omit<Result, '__internalHash'> = {
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

        return {
            ...resultWithoutHash,
            __internalHash: objectHash(
                resultWithoutHash
            ) as Result['__internalHash'],
        };
    });
}

/**
 * Write results to file at `./eslint-remote-tester-results`
 */
export async function writeResults(
    messages: LintMessage[],
    repository: string
): Promise<void> {
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

        await new Promise((resolve, reject) => {
            const stream = fs
                .createWriteStream(`${RESULTS_LOCATION}/${fileName}`, {
                    encoding: 'utf8',
                })
                .on('finish', resolve)
                .on('error', reject);

            while (results.length > 0) {
                const chunk = results.splice(0, 200);
                const formattedResults = chunk.map(RESULT_TEMPLATE).join('\n');
                stream.write(formattedResults);
            }
            stream.end();
        });
    }
}
