import fs from 'fs';
import { ESLint, Linter } from 'eslint';

import config from './config';
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

/**
 * Picks out messages which are under testing and constructs a small snippet of
 * the erroneous code block
 */
export function mergeMessagesWithSource(
    all: Linter.LintMessage[],
    result: ESLint.LintResult
): Linter.LintMessage[] {
    const messages = result.messages.filter(
        message =>
            message.ruleId && config.rulesUnderTesting.includes(message.ruleId)
    );

    // Process only rules that are under testing
    if (messages.length === 0) {
        return all;
    }

    const sourceLines = result.source ? result.source.split('\n') : [];

    return [
        ...all,
        ...messages.map(message => ({
            ...message,
            // Construct small snippet of the erroneous code block
            source: sourceLines
                .slice(
                    Math.max(0, message.line - 2),
                    Math.min(sourceLines.length, 2 + (message.endLine || 0))
                )
                .join('\n'),
        })),
    ];
}
