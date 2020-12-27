import chalk from 'chalk';
import { ESLint } from 'eslint';

import {
    Config,
    ConfigToValidate,
    ConfigWithOptionals,
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
const DEFAULT_CI = process.env.CI === 'true';
const DEFAULT_CACHE = true;

const UNKNOWN_RULE_REGEXP = /^Definition for rule (.*) was not found.$/;

/**
 * Validate array of strings:
 * 1. Object is required
 * 2. Object is array
 * 3. Object contains only strings
 * 4. Object contains no duplicates
 */
function validateStringArray(
    name: keyof Config,
    array: string[] | undefined
): string | undefined {
    if (!array || !array.length) {
        return `Missing ${name}.`;
    } else if (!Array.isArray(array)) {
        return `${name} should be an array.`;
    } else if (!array.every(item => typeof item === 'string')) {
        return `${name} should contain only strings`;
    } else {
        const duplicateItems = array.filter(
            (item, index, items) => items.indexOf(item) !== index
        );

        if (duplicateItems.length) {
            return `${name} contains duplicate entries: [${duplicateItems.join(
                ', '
            )}]`;
        }
    }
}

/**
 * Validate optional positive number:
 * 1. Value is optional
 * 2. Type is number
 * 3. Value is positive
 */
function validateOptionalPositiveNumber(
    name: keyof Config,
    value: number | undefined
) {
    if (value != null && typeof value !== 'number') {
        return `${name} (${value}) should be a number.`;
    } else if (value != null && value <= 0) {
        return `${name} (${value}) should be a positive number.`;
    }
}

/**
 * Validate given configuration
 */
export default async function validate(
    configToValidate: ConfigToValidate
): Promise<void> {
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

    const errors: (string | undefined)[] = [];

    // Validate no unknown options were given
    const unsupportedOptions = Object.keys(unknownKeys);
    if (unsupportedOptions.length) {
        errors.push(
            `Options [${unsupportedOptions.join(', ')}] are not supported`
        );
    }

    // Required fields
    errors.push(validateStringArray('repositories', repositories));

    errors.push(validateStringArray('extensions', extensions));

    if (!eslintrc || Object.keys(eslintrc).length === 0) {
        errors.push(`Missing eslintrc.`);
    } else {
        try {
            // This will throw when eslintrc is invalid
            const linter = new ESLint({
                useEslintrc: false,
                overrideConfig: eslintrc,
            });

            errors.push(await validateEslintRules(linter));
        } catch (e) {
            errors.push(`eslintrc: ${e.message}`);
        }
    }

    // Optional fields

    // TODO nice-to-have: Validate rules match eslintrc config
    // https://eslint.org/docs/developer-guide/nodejs-api#lintergetrules
    if (rulesUnderTesting && rulesUnderTesting.length) {
        errors.push(
            validateStringArray('rulesUnderTesting', rulesUnderTesting)
        );
    }

    if (pathIgnorePattern) {
        try {
            new RegExp(pathIgnorePattern);
        } catch (e) {
            errors.push(
                `pathIgnorePattern (${pathIgnorePattern}) is not valid regex: ${e.message}`
            );
        }
    }

    errors.push(
        validateOptionalPositiveNumber('maxFileSizeBytes', maxFileSizeBytes)
    );

    if (CI != null && typeof CI !== 'boolean') {
        errors.push(`CI (${CI}) should be a boolean.`);
    }

    if (logLevel && !LOG_LEVELS.includes(logLevel)) {
        errors.push(
            `logLevel (${logLevel}) is not valid value. Known values are ${LOG_LEVELS.join(
                ', '
            )}`
        );
    }

    if (cache != null && typeof cache !== 'boolean') {
        errors.push(`cache (${cache}) should be a boolean.`);
    }

    if (resultParser && !RESULT_PARSERS.includes(resultParser)) {
        errors.push(
            `resultParser (${resultParser}) is not valid value. Known values are ${RESULT_PARSERS.join(
                ', '
            )}`
        );
    }

    errors.push(
        validateOptionalPositiveNumber('concurrentTasks', concurrentTasks)
    );

    errors.push(validateOptionalPositiveNumber('timeLimit', timeLimit));

    if (onComplete && typeof onComplete !== 'function') {
        errors.push(`onComplete (${onComplete}) should be a function`);
    }

    const validationErrors = errors.filter(Boolean).join('\n- ');
    if (validationErrors.length) {
        console.log(
            chalk.red`Configuration validation errors: \n- ${validationErrors}`
        );
        process.exit(1);
    }
}

/**
 * Get configuration with default values on optional fields
 */
export function getConfigWithDefaults(config: ConfigWithOptionals): Config {
    const CI = config.CI != null ? config.CI : DEFAULT_CI;

    let pathIgnorePattern = undefined;
    if (config.pathIgnorePattern) {
        try {
            pathIgnorePattern = new RegExp(config.pathIgnorePattern);
        } catch (_) {
            // Faulty patterns are validated separately by validateConfig
        }
    }

    return {
        ...config,

        rulesUnderTesting: config.rulesUnderTesting || [],

        pathIgnorePattern,

        maxFileSizeBytes:
            config.maxFileSizeBytes || DEFAULT_MAX_FILE_SIZE_BYTES,

        CI,

        logLevel: config.logLevel || DEFAULT_LOG_LEVEL,

        cache: config.cache != null ? config.cache : DEFAULT_CACHE,

        resultParser:
            config.resultParser || CI
                ? DEFAULT_RESULT_PARSER_CI
                : DEFAULT_RESULT_PARSER_CLI,

        concurrentTasks: config.concurrentTasks || DEFAULT_CONCURRENT_TASKS,

        timeLimit: config.timeLimit || DEFAULT_TIME_LIMIT_SECONDS,
    };
}

/**
 * Validate given rules of `config.eslintrc.rules`
 * - When unknown rules are defined, or known ones are mispelled they are not
 *   reported during linting. We need to specifically look for them.
 */
async function validateEslintRules(
    linter: ESLint
): Promise<string | undefined> {
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
        return `Configuration validation errors at eslintrc.rules: \n  - ${errors.join(
            '\n  - '
        )}`;
    }
}
