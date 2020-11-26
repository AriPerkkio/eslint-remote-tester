import { ResultParser } from '@config/types';
import { LintMessage } from '@engine/types';

export interface ResultTemplateOptions {
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
const RESULT_TEMPLATE_PLAINTEXT = (options: ResultTemplateOptions): string =>
`Rule: ${options.rule}
Message: ${options.message}
Path: ${options.path}
Link: ${options.link}

${options.source}
${options.error ? `
Error:
${options.error}
` : ''}`;

// prettier-ignore
const RESULT_TEMPLATE_MARKDOWN = (options: ResultTemplateOptions): string =>
`## Rule: ${options.rule}
- Message: \`${options.message}\`
- Path: \`${options.path}\`
- [Link](${options.link})
\`\`\`${options.extension || ''}
${options.source || ''}
\`\`\`
${options.error ?
`\`\`\`
${options.error}
\`\`\`` : ''}`;

// prettier-ignore
export const RESULTS_TEMPLATE_CI_BASE = (options: ResultTemplateOptions): string =>
`Repository: ${options.repositoryOwner}/${options.repository}`;

export const RESULT_PARSER_TO_TEMPLATE: Record<
    ResultParser,
    (options: ResultTemplateOptions) => string
> = {
    plaintext: RESULT_TEMPLATE_PLAINTEXT,
    markdown: RESULT_TEMPLATE_MARKDOWN,
} as const;

export const RESULT_PARSER_TO_EXTENSION: Record<ResultParser, string> = {
    plaintext: '',
    markdown: '.md',
} as const;
