import { type ResultParser } from '../config/types.js';
import { type LintMessage } from '../engine/types.js';

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
    __internalHash: string & { readonly _: unique symbol };
}

export interface ComparisonResults {
    /** New results compared to previous scan */
    added: Result[];

    /** Removed results compared to previous scan */
    removed: Result[];
}

type ComparisonType = keyof ComparisonResults;
export const ComparisonTypes: ComparisonType[] = ['added', 'removed'];

export type ResultTemplate = (result: Result) => string;
export type ComparisonResultTemplate = {
    header: (type: ComparisonType) => string;
    results: (result: Result) => string;
};

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

export const RESULT_PARSER_TO_TEMPLATE: Record<ResultParser, ResultTemplate> = {
    plaintext: RESULT_TEMPLATE_PLAINTEXT,
    markdown: RESULT_TEMPLATE_MARKDOWN,
} as const;

const COMPARISON_RESULT_HEADER_PLAINTEXT = (type: ComparisonType) =>
    `${upperCaseFirstLetter(type)}:`;

const COMPARISON_RESULT_HEADER_MARKDOWN = (type: ComparisonType) =>
    `# ${upperCaseFirstLetter(type)}:`;

export const RESULT_PARSER_TO_COMPARE_TEMPLATE: Record<
    ResultParser,
    ComparisonResultTemplate
> = {
    plaintext: {
        header: COMPARISON_RESULT_HEADER_PLAINTEXT,
        results: RESULT_TEMPLATE_PLAINTEXT,
    },
    markdown: {
        header: COMPARISON_RESULT_HEADER_MARKDOWN,
        results: RESULT_TEMPLATE_MARKDOWN,
    },
} as const;

export const RESULT_PARSER_TO_EXTENSION: Record<ResultParser, string> = {
    plaintext: '',
    markdown: '.md',
} as const;

function upperCaseFirstLetter(text: string) {
    const [firstLetter, ...letters] = text;

    return [firstLetter.toUpperCase(), ...letters].join('');
}
