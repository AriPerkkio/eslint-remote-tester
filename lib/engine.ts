import { ESLint, Linter } from 'eslint';

import config from './config';
import { LintMessage, SourceFile } from './types';

/**
 * Wrapper around ESLint's engine
 */
class Engine {
    linter: ESLint;

    constructor() {
        this.linter = new ESLint({
            useEslintrc: false,
            overrideConfig: config.eslintrc,
        });
    }

    /**
     * Run ESLint on given file
     */
    async lint(file: SourceFile): Promise<LintMessage[]> {
        const { content, path } = file;

        const result = await this.linter.lintText(content);
        const messages = result
            .reduce(mergeMessagesWithSource, [])
            .filter(Boolean);

        return messages.map(message => ({ ...message, path }));
    }
}

function mergeMessagesWithSource(
    all: Linter.LintMessage[],
    result: ESLint.LintResult
) {
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

export default new Engine();
