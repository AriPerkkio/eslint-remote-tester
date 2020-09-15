import fs from 'fs';

import { LintMessage } from './types';

const RESULTS_LOCATION = './results';
if (!fs.existsSync(RESULTS_LOCATION)) {
    fs.mkdirSync(RESULTS_LOCATION);
}

const RESULT_TEMPLATE = (result: LintMessage) =>
    `Rule: ${result.ruleId}
Message: ${result.message}
Path: ${result.path}
${result.source}
`;

function formatResults(results: LintMessage[]) {
    return results.map(RESULT_TEMPLATE).join('\n');
}

/**
 * Write results to file at `./results`
 */
export function writeResults(results: LintMessage[], repository: string): void {
    const [, repoName] = repository.split('/');

    const formattedResults = results.length
        ? formatResults(results)
        : 'No issues';

    fs.writeFileSync(
        `${RESULTS_LOCATION}/${repoName}`,
        formattedResults,
        'utf8'
    );
}
