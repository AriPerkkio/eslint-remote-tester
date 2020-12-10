import { getConsoleLogCalls } from './utils';
import validator from '@config/validator';
import { ConfigToValidate } from '@config/types';

const DEFAULT_CONFIGURATION: ConfigToValidate = {
    repositories: ['test-repo'],
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
    test('repositories are required', () => {
        const config = { ...DEFAULT_CONFIGURATION, repositories: undefined! };
        validator(config);

        const [validationError] = getConsoleLogCalls();
        expect(validationError).toMatch('Configuration validation errors:');
        expect(validationError).toMatch('- Missing repositories.');
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
