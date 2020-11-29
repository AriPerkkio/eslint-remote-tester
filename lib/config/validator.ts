import chalk from 'chalk';

import { Config, ResultParser } from './types';

const RESULT_PARSERS: ResultParser[] = ['plaintext', 'markdown'];
const DEFAULT_RESULT_PARSER_CLI: ResultParser = 'markdown';
const DEFAULT_RESULT_PARSER_CI: ResultParser = 'plaintext';
const DEFAULT_CONCURRENT_TASKS = 5;
const DEFAULT_MAX_FILE_SIZE_BYTES = 2000000;

export default function constructAndValidateConfiguration(
    configToValidate: Config
): Config {
    const {
        repositories,
        extensions,
        pathIgnorePattern,
        maxFileSizeBytes,
        rulesUnderTesting,
        resultParser,
        concurrentTasks,
        eslintrc,
        CI,
        cache,
        onComplete,
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

    if (maxFileSizeBytes != null && typeof maxFileSizeBytes !== 'number') {
        errors.push(
            `maxFileSizeBytes (${maxFileSizeBytes}) should be a number.`
        );
    } else if (maxFileSizeBytes == null) {
        config.maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES;
    }

    if (CI != null && typeof CI !== 'boolean') {
        errors.push(`CI (${CI}) should be a boolean.`);
    } else {
        // Resolve CI from configuration file, if found. Fallback to environment variables.
        config.CI = CI == null ? process.env.CI === 'true' : CI;
    }

    if (cache != null && typeof cache !== 'boolean') {
        errors.push(`cache (${cache}) should be a boolean.`);
    } else if (cache == null) {
        config.cache = true;
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

    if (onComplete && typeof onComplete !== 'function') {
        errors.push(`onComplete (${onComplete}) should be a function`);
    }

    if (errors.length) {
        console.log(
            chalk.red(
                `Configuration validation errors: \n- ${errors.join('\n- ')}`
            )
        );
        process.exit(1);
    }

    return config;
}
