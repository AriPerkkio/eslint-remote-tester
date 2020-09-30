import { ResultParser } from '../config/types';
import { LintMessage } from '../engine/types';

interface ResultTemplateOptions {
    rule: LintMessage['ruleId'];
    message: LintMessage['message'];
    path: string;
    link: string;
    extension?: string;
    source: LintMessage['source'];
}

const RESULT_TEMPLATE_PLAINTEXT = (options: ResultTemplateOptions): string =>
    `Rule: ${options.rule}
Message: ${options.message}
Path: ${options.path}
Link: ${options.link}
${options.source}
`;

const RESULT_TEMPLATE_MARKDOWN = (options: ResultTemplateOptions): string =>
    `## Rule: ${options.rule}
- Message: \`${options.message}\`
- Path: \`${options.path}\`
- [Link](${options.link})
\`\`\`${options.extension || ''}
${options.source}
\`\`\`
`;

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
