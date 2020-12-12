import { getConsoleLogCalls } from './utils';
import validator from '@config/validator';
import { ConfigToValidate } from '@config/types';

const DEFAULT_CONFIGURATION: ConfigToValidate = {
    repositories: ['test-repo', 'test-repo-2'],
    extensions: ['.ts', '.tsx'],
    pathIgnorePattern: undefined,
    maxFileSizeBytes: undefined,
    rulesUnderTesting: [],
    resultParser: 'plaintext',
    concurrentTasks: undefined,
    eslintrc: {},
    CI: undefined,
    cache: undefined,
    logLevel: undefined,
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

    test('additional options are unsupported', () => {
        const key = 'someMistypedKey';
        const config = { ...DEFAULT_CONFIGURATION, [key]: true };
        validator(config);

        const [validationError] = getConsoleLogCalls();
        expect(validationError).toMatch('Configuration validation errors:');
        expect(validationError).toMatch(`- Options [${key}] are not supported`);
    });
});
