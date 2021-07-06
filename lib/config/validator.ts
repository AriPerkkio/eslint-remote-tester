import chalk from 'chalk';
import { ESLint } from 'eslint';

import {
    Config,
    ConfigToValidate,
    ConfigWithOptionals,
    LogLevel,
    LogLevels as LOG_LEVELS,
    ResultParser,
    ResultParsers as RESULT_PARSERS,
} from './types';

const DEFAULT_RESULT_PARSER_CLI: ResultParser = 'markdown';
const DEFAULT_RESULT_PARSER_CI: ResultParser = 'plaintext';
const DEFAULT_LOG_LEVEL: LogLevel = 'verbose';
const DEFAULT_CONCURRENT_TASKS = 5;
const DEFAULT_MAX_FILE_SIZE_BYTES = 2000000;
const DEFAULT_TIME_LIMIT_SECONDS = 5.5 * 60 * 60;
const DEFAULT_CI = process.env.CI === 'true';
const DEFAULT_CACHE = true;
const DEFAULT_COMPARE = false;
const DEFAULT_UPDATE_COMPARISON_REFERENCE = true;

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
 * Validate optional boolean:
 * 1. Value is optional
 * 2. Type is boolean
 */
function validateOptionalBoolean(
    name: keyof Config,
    value: boolean | undefined
) {
    if (value != null && typeof value !== 'boolean') {
        return `${name} (${value}) should be a boolean.`;
    }
}

/**
 * Validate given configuration
 */
export default async function validate(
    configToValidate: ConfigToValidate,
    exitWhenError = true
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
        compare,
        updateComparisonReference,
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

    if (!eslintrc) {
        errors.push(`Missing eslintrc.`);
    } else {
        try {
            // This will throw when eslintrc is invalid
            const linter = new ESLint({
                useEslintrc: false,
                overrideConfig:
                    typeof eslintrc === 'function' ? eslintrc() : eslintrc,
            });

            errors.push(await validateEslintRules(linter));
        } catch (e) {
            errors.push(`eslintrc: ${e.message}`);

            if (typeof eslintrc === 'function') {
                errors.push(
                    'Note that "config.eslintrc" is called with empty options during configuration validation.'
                );
            }
        }
    }

    // Optional fields

    // TODO nice-to-have: Validate rules match eslintrc config
    // https://eslint.org/docs/developer-guide/nodejs-api#lintergetrules
    if (rulesUnderTesting) {
        if (Array.isArray(rulesUnderTesting)) {
            // Empty rulesUnderTesting is valid
            if (rulesUnderTesting.length) {
                errors.push(
                    validateStringArray('rulesUnderTesting', rulesUnderTesting)
                );
            }
        } else if (typeof rulesUnderTesting !== 'function') {
            errors.push(
                `rulesUnderTesting should be either an array or function.`
            );
        }
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

    errors.push(validateOptionalBoolean('CI', CI));

    if (logLevel && !LOG_LEVELS.includes(logLevel)) {
        errors.push(
            `logLevel (${logLevel}) is not valid value. Known values are ${LOG_LEVELS.join(
                ', '
            )}`
        );
    }

    errors.push(validateOptionalBoolean('cache', cache));

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

    errors.push(validateOptionalBoolean('compare', compare));
    errors.push(
        validateOptionalBoolean(
            'updateComparisonReference',
            updateComparisonReference
        )
    );

    if (onComplete && typeof onComplete !== 'function') {
        errors.push(`onComplete (${onComplete}) should be a function`);
    }

    const validationErrors = errors.filter(Boolean).join('\n- ');
    if (validationErrors.length) {
        const errorMessage = `Configuration validation errors:\n- ${validationErrors}`;
        console.log(chalk.red(errorMessage));

        if (exitWhenError) {
            process.exit(1);
        } else {
            throw new Error(errorMessage);
        }
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
            config.resultParser ||
            (CI ? DEFAULT_RESULT_PARSER_CI : DEFAULT_RESULT_PARSER_CLI),

        concurrentTasks: config.concurrentTasks || DEFAULT_CONCURRENT_TASKS,

        timeLimit: config.timeLimit || DEFAULT_TIME_LIMIT_SECONDS,

        compare: config.compare != null ? config.compare : DEFAULT_COMPARE,

        updateComparisonReference:
            config.updateComparisonReference != null
                ? config.updateComparisonReference
                : DEFAULT_UPDATE_COMPARISON_REFERENCE,
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
