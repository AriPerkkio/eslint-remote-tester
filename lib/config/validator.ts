import { Config } from './types';

export default function validateConfiguration(config: Config): void {
    const {
        repositories,
        extensions,
        pathIgnorePattern,
        rulesUnderTesting,
        concurrentTasks,
        eslintrc,
    } = config;
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
            new RegExp(pathIgnorePattern);
        } catch (e) {
            errors.push(
                `pathIgnorePattern (${pathIgnorePattern}) is not valid regex: ${e.message}`
            );
        }
    }
    if (concurrentTasks && typeof concurrentTasks !== 'number') {
        errors.push(`concurrentTasks (${concurrentTasks}) should be a number.`);
    }

    if (errors.length) {
        const configurationValidationErrors = `Configuration validation errors: ${errors.join(
            '\n'
        )}\n`;

        throw new Error(configurationValidationErrors);
    }
}
