import fs from 'fs';

import { CACHE_LOCATION } from './repository-client';
import { LintMessage } from '../types';

const RESULTS_LOCATION = './results';
if (!fs.existsSync(RESULTS_LOCATION)) {
    fs.mkdirSync(RESULTS_LOCATION);
}

const RESULT_TEMPLATE = (result: LintMessage) =>
    `Rule: ${result.ruleId}
Message: ${result.message}
Path: ${result.path.replace(CACHE_LOCATION, '')}
${result.source}
`;

function formatResults(results: LintMessage[]) {
    return results.map(RESULT_TEMPLATE).join('\n');
}

/**
 * Write results to file at `./results`
 */
export function writeResults(results: LintMessage[], repository: string): void {
    const [, repositoryName] = repository.split('/');

    const formattedResults = results.length
        ? formatResults(results)
        : 'No issues';

    fs.writeFileSync(
        `${RESULTS_LOCATION}/${repositoryName}`,
        formattedResults,
        'utf8'
    );
}
