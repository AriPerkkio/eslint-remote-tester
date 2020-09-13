const { ESLint } = require('eslint');
const config = require('./config');

/**
 * Wrapper around ESLint's engine
 */
class Engine {
    constructor() {
        this.linter = new ESLint({
            useEslintrc: false,
            overrideConfig: config.eslintrc,
        });
    }

    /**
     * Run ESLint on given file
     *
     * @param {{ content: String, path: String }} file File to lint
     * @returns {Promise<Array.<{
     *  ruleId: String,
     *  message: String,
     *  path: String,
     *  source: String
     * }>>}
     */
    async lint(file) {
        const { content, path } = file;

        const result = await this.linter.lintText(content);
        const messages = result
            .reduce(mergeMessagesWithSource, [])
            .filter(Boolean);

        return messages.map(message => ({ ...message, path }));
    }
}

function mergeMessagesWithSource(all, result) {
    const messages = result.messages.filter(message =>
        config.rulesUnderTesting.includes(message.ruleId)
    );

    // Process only rules that are under testing
    if (messages.length === 0) {
        return all;
    }

    const sourceLines = result.source.split('\n');

    return [
        ...all,
        ...messages.map(message => ({
            ...message,
            // Construct small snippet of the erroneous code block
            source: sourceLines
                .slice(
                    Math.max(0, message.line - 2),
                    Math.min(sourceLines.length, message.endLine + 2)
                )
                .join('\n'),
        })),
    ];
}

module.exports = new Engine();
