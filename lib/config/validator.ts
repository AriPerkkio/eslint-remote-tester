import chalk from 'chalk';
import { ESLint } from 'eslint';

import {
    Config,
    ConfigToValidate,
    LogLevel,
    LogLevels,
    ResultParser,
    ResultParsers,
} from './types';

const RESULT_PARSERS: typeof ResultParsers = ['plaintext', 'markdown'];
const LOG_LEVELS: typeof LogLevels = ['verbose', 'info', 'warn', 'error'];

const DEFAULT_RESULT_PARSER_CLI: ResultParser = 'markdown';
const DEFAULT_RESULT_PARSER_CI: ResultParser = 'plaintext';
const DEFAULT_LOG_LEVEL: LogLevel = 'verbose';
const DEFAULT_CONCURRENT_TASKS = 5;
const DEFAULT_MAX_FILE_SIZE_BYTES = 2000000;
const DEFAULT_TIME_LIMIT_SECONDS = 5.5 * 60 * 60;

const UNKNOWN_RULE_REGEXP = /^Definition for rule (.*) was not found.$/;

export default function constructAndValidateConfiguration(
    configToValidate: ConfigToValidate
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
        logLevel,
        cache,
        timeLimit,
        onComplete,
        ...unknownKeys
    } = configToValidate;

    const config = { ...configToValidate };
    const errors: string[] = [];

    // Validate no unknown options were given
    const unsupportedOptions = Object.keys(unknownKeys);
    if (unsupportedOptions.length) {
        errors.push(
            `Options [${unsupportedOptions.join(', ')}] are not supported`
        );
    }

    // Required fields
    if (!repositories || !repositories.length) {
        errors.push(`Missing repositories.`);
    } else {
        const duplicateRepositories = repositories.filter(
            (item, index, array) => array.indexOf(item) !== index
        );

        if (duplicateRepositories.length) {
            errors.push(
                `repositories contains duplicate entries: [${duplicateRepositories.join(
                    ', '
                )}]`
            );
        }
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

    if (logLevel && !LOG_LEVELS.includes(logLevel)) {
        errors.push(
            `logLevel (${logLevel}) is not valid value. Known values are ${LOG_LEVELS.join(
                ', '
            )}`
        );
    } else if (!logLevel) {
        config.logLevel = DEFAULT_LOG_LEVEL;
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

    if (timeLimit != null && typeof timeLimit !== 'number') {
        errors.push(`timeLimit (${timeLimit}) should be a number.`);
    } else if (timeLimit == null) {
        config.timeLimit = DEFAULT_TIME_LIMIT_SECONDS;
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

    return config as Config;
}

/**
 * Validate given rules of `config.eslintrc.rules`
 * - When unknown rules are defined, or known ones are mispelled they are not
 *   reported during linting. We need to specifically look for them.
 * - Separate method from `constructAndValidateConfiguration` due to async
 *   implementation of `linter.lintText`
 */
export async function validateEslintrcRules(config: Config): Promise<void> {
    const linter = new ESLint({
        useEslintrc: false,
        overrideConfig: config.eslintrc,
    });

    const results = await linter.lintText('');
    const errors = [];

    for (const result of results) {
        for (const resultMessage of result.messages) {
            if (UNKNOWN_RULE_REGEXP.test(resultMessage.message)) {
                errors.push(resultMessage.message);
            }
        }
    }

    if (errors.length) {
        console.log(
            chalk.red(
                `Configuration validation errors at eslintrc.rules: \n- ${errors.join(
                    '\n- '
                )}`
            )
        );
        process.exit(1);
    }
}
