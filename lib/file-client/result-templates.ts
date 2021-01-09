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

export const RESULT_PARSER_TO_TEMPLATE: Record<
    ResultParser,
    (result: Result) => string
> = {
    plaintext: RESULT_TEMPLATE_PLAINTEXT,
    markdown: RESULT_TEMPLATE_MARKDOWN,
} as const;

export const RESULT_PARSER_TO_EXTENSION: Record<ResultParser, string> = {
    plaintext: '',
    markdown: '.md',
} as const;
