import { getConsoleLogCalls } from '../utils';
import validator from '@config/validator';
import { ConfigToValidate } from '@config/types';

const DEFAULT_CONFIGURATION: ConfigToValidate = {
    repositories: ['test-repo', 'test-repo-2'],
    extensions: ['.ts', '.tsx'],
    rulesUnderTesting: [],
    eslintrc: {},
    pathIgnorePattern: undefined,
    maxFileSizeBytes: undefined,
    resultParser: undefined,
    concurrentTasks: undefined,
    CI: undefined,
    cache: undefined,
    logLevel: undefined,
    timeLimit: undefined,
    onComplete: undefined,
};

describe('Config validator', () => {
    test('valid configuration is accepted', () => {
        validator(DEFAULT_CONFIGURATION);

        const validationErrors = getConsoleLogCalls();
        expect(validationErrors.join(',')).toBeFalsy();
    });

    test('repositories are required', () => {
        const config = { ...DEFAULT_CONFIGURATION, repositories: undefined! };
        validator(config);

        const [validationError] = getConsoleLogCalls();
        expect(validationError).toMatch('Configuration validation errors:');
        expect(validationError).toMatch('- Missing repositories.');
    });

    test('duplicate repositories are unsupported', () => {
        const repositories = [
            'duplicate-1',
            'valid',
            'duplicate-1',
            'duplicate-2',
            'valid-2',
            'duplicate-2',
        ];
        const config = { ...DEFAULT_CONFIGURATION, repositories };
        validator(config);

        const [validationError] = getConsoleLogCalls();
        expect(validationError).toMatch('Configuration validation errors:');
        expect(validationError).toMatch(
            '- repositories contains duplicate entries: [duplicate-1, duplicate-2]'
        );
    });

    test('default values are set in CI mode', () => {
        const config = validator({ ...DEFAULT_CONFIGURATION, CI: true });

        expect(config.resultParser).toBe('plaintext');
        expect(config.logLevel).toBe('verbose');
        expect(config.concurrentTasks).toBe(5);
        expect(config.maxFileSizeBytes).toBe(2e6);
        expect(config.timeLimit).toBe(5.5 * 60 * 60);
        expect(config.pathIgnorePattern).toBe(undefined);
        expect(config.onComplete).toBe(undefined);
    });

    test('default values are set in CLI mode', () => {
        const config = validator({ ...DEFAULT_CONFIGURATION, CI: false });

        expect(config.resultParser).toBe('markdown');
        expect(config.logLevel).toBe('verbose');
        expect(config.concurrentTasks).toBe(5);
        expect(config.maxFileSizeBytes).toBe(2e6);
        expect(config.timeLimit).toBe(5.5 * 60 * 60);
        expect(config.pathIgnorePattern).toBe(undefined);
        expect(config.onComplete).toBe(undefined);
    });

    test('default value for CI is set', () => {
        const config = validator(DEFAULT_CONFIGURATION);

        expect(config.CI).toBe(process.env.CI === 'true');
    });

    test('additional options are unsupported', () => {
        const key = 'someMistypedKey';
        const config = { ...DEFAULT_CONFIGURATION, [key]: true };
        validator(config);

        const [validationError] = getConsoleLogCalls();
        expect(validationError).toMatch('Configuration validation errors:');
        expect(validationError).toMatch(`- Options [${key}] are not supported`);
    });
});
