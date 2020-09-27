import fs from 'fs';

import config from '../config';
import { CACHE_LOCATION, URL } from './repository-client';
import { LintMessage } from '../types';

const RESULTS_CI: string[] = [];
const RESULTS_LOCATION = './results';

if (!fs.existsSync(RESULTS_LOCATION)) {
    fs.mkdirSync(RESULTS_LOCATION);
} else {
    fs.readdirSync(RESULTS_LOCATION).forEach(result =>
        fs.unlinkSync(`${RESULTS_LOCATION}/${result}`)
    );
}

const RESULT_TEMPLATE_CLI = (result: LintMessage) => {
    const fullPath = result.path.replace(`${CACHE_LOCATION}/`, '');
    const [project, repository, ...pathParts] = fullPath.split('/');
    const lines = `#L${result.line}${
        result.endLine ? `-L${result.endLine}` : ''
    }`;

    return `Rule: ${result.ruleId}
Message: ${result.message}
Path: ${fullPath}
Link: ${URL}/${project}/${repository}/blob/HEAD/${pathParts.join('/')}${lines}
${result.source}
`;
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
            `${RESULTS_LOCATION}/${repositoryName}`,
            formattedResults,
            'utf8'
        );
    }
}

export function printResultsCI(): void {
    if (RESULTS_CI.length) {
        console.log(RESULTS_CI.join('\n'));
    } else {
        console.log('No errors');
    }
}
