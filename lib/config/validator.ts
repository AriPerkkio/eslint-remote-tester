import { Config } from './types';

const DEFAULT_CONCURRENT_TASKS = 5;

export default function constructAndValidateConfiguration(
    configToValidate: Config
): Config {
    const {
        repositories,
        extensions,
        pathIgnorePattern,
        rulesUnderTesting,
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

    if (concurrentTasks && typeof concurrentTasks !== 'number') {
        errors.push(`concurrentTasks (${concurrentTasks}) should be a number.`);
    } else if (concurrentTasks == null) {
        config.concurrentTasks = DEFAULT_CONCURRENT_TASKS;
    }

    if (CI != null && typeof CI !== 'boolean') {
        errors.push(`CI (${CI}) should be a boolean.`);
    } else {
        config.CI = process.env.CI == null ? CI : !!process.env.CI;
    }

    if (errors.length) {
        const configurationValidationErrors = `Configuration validation errors: ${errors.join(
            '\n'
        )}\n`;

        throw new Error(configurationValidationErrors);
    }

    return config;
}
