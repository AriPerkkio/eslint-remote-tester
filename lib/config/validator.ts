import chalk from 'chalk';

import { Config, ResultParser } from './types';

const RESULT_PARSERS: ResultParser[] = ['plaintext', 'markdown'];
const DEFAULT_RESULT_PARSER_CLI: ResultParser = 'markdown';
const DEFAULT_RESULT_PARSER_CI: ResultParser = 'plaintext';
const DEFAULT_CONCURRENT_TASKS = 5;

export default function constructAndValidateConfiguration(
    configToValidate: Config
): Config {
    const {
        repositories,
        extensions,
        pathIgnorePattern,
        rulesUnderTesting,
        resultParser,
        concurrentTasks,
        eslintrc,
        CI,
    } = configToValidate;

    const config = { ...configToValidate };
    const errors: string[] = [];

    // Required fields
    if (!repositories || !repositories.length) {
        errors.push(`Missing repositories.`);
    }

    if (!extensions || !extensions.length) {
        errors.push(`Missing extensions.`);
    }

    if (!rulesUnderTesting) {
        errors.push(`Missing rulesUnderTesting.`);
    } else if (!Array.isArray(rulesUnderTesting)) {
        errors.push(`Config rulesUnderTesting should be an array.`);
    }

    if (!eslintrc) {
        errors.push(`Missing eslintrc.`);
    }

    // Optional fields
    if (pathIgnorePattern) {
        try {
            config.pathIgnorePattern = new RegExp(pathIgnorePattern);
        } catch (e) {
            errors.push(
                `pathIgnorePattern (${pathIgnorePattern}) is not valid regex: ${e.message}`
            );
        }
    }

    if (CI != null && typeof CI !== 'boolean') {
        errors.push(`CI (${CI}) should be a boolean.`);
    } else {
        // Resolve CI from environment variables, if found. Fallback to configuration file.
        config.CI =
            process.env.CI == null || process.env.CI == 'null'
                ? CI
                : process.env.CI === 'true';
    }

    if (resultParser && !RESULT_PARSERS.includes(resultParser)) {
        errors.push(
            `resultParser (${resultParser}) is not valid value. Known values are ${RESULT_PARSERS.join(
                ', '
            )}`
        );
    } else if (!resultParser) {
        config.resultParser = config.CI
            ? DEFAULT_RESULT_PARSER_CI
            : DEFAULT_RESULT_PARSER_CLI;
    }

    if (concurrentTasks && typeof concurrentTasks !== 'number') {
        errors.push(`concurrentTasks (${concurrentTasks}) should be a number.`);
    } else if (concurrentTasks == null) {
        config.concurrentTasks = DEFAULT_CONCURRENT_TASKS;
    }

    if (errors.length) {
        console.log(
            chalk.red(
                `Configuration validation errors: \n- ${errors.join('\n- ')}`
            )
        );
        process.exit();
    }

    return config;
}
