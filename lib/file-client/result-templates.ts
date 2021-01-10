import { ResultParser } from '@config/types';
import { LintMessage } from '@engine/types';

const NEW_LINE_REGEX = /\n/g;

// Note that this is part of public API
export interface Result {
    repository: string;
    repositoryOwner: string;
    rule: LintMessage['ruleId'];
    message: LintMessage['message'];
    path: string;
    link: string;
    extension?: string;
    source: LintMessage['source'];
    error?: LintMessage['error'];
}

export interface ComparisonResults {
    /** New results compared to previous scan */
    added: Result[];

    /** Removed results compared to previous scan */
    removed: Result[];
}

type ComparisonType = keyof ComparisonResults;
export const ComparisonTypes: ComparisonType[] = ['added', 'removed'];

// prettier-ignore
const RESULT_TEMPLATE_PLAINTEXT = (result: Result): string =>
`Rule: ${result.rule}
Message: ${result.message}
Path: ${result.path}
Link: ${result.link}

${result.source}
${result.error ? `
Error:
${result.error}
` : ''}`;

// prettier-ignore
const RESULT_TEMPLATE_MARKDOWN = (result: Result): string =>
`## Rule: ${result.rule}

-   Message: \`${result.message.replace(NEW_LINE_REGEX, ' ')}\`
-   Path: \`${result.path}\`
-   [Link](${result.link})

\`\`\`${result.extension || ''}
${result.source || ''}
\`\`\`
${result.error ? `
\`\`\`
${result.error}
\`\`\`
` : ''}`;

// prettier-ignore
export const RESULTS_TEMPLATE_CI_BASE = (result: Result): string =>
`Repository: ${result.repositoryOwner}/${result.repository}`;

// prettier-ignore
const COMPARISON_RESULTS_TEMPLATE_PLAINTEXT = (type: ComparisonType, results: Result[]): string =>
`${upperCaseFirstLetter(type)}:
${results.map(RESULT_TEMPLATE_PLAINTEXT).join('\n')}`;

// prettier-ignore
const COMPARISON_RESULTS_TEMPLATE_MARKDOWN = (type: ComparisonType, results: Result[]): string =>
`# ${upperCaseFirstLetter(type)}:
${results.map(RESULT_TEMPLATE_MARKDOWN).join('\n')}`;

export const RESULT_PARSER_TO_TEMPLATE: Record<
    ResultParser,
    (result: Result) => string
> = {
    plaintext: RESULT_TEMPLATE_PLAINTEXT,
    markdown: RESULT_TEMPLATE_MARKDOWN,
} as const;

export const RESULT_PARSER_TO_COMPARE_TEMPLATE: Record<
    ResultParser,
    (type: ComparisonType, results: Result[]) => string
> = {
    plaintext: COMPARISON_RESULTS_TEMPLATE_PLAINTEXT,
    markdown: COMPARISON_RESULTS_TEMPLATE_MARKDOWN,
} as const;

export const RESULT_PARSER_TO_EXTENSION: Record<ResultParser, string> = {
    plaintext: '',
    markdown: '.md',
} as const;

function upperCaseFirstLetter(text: string) {
    const [firstLetter, ...letters] = text;

    return [firstLetter.toUpperCase(), ...letters].join('');
}
