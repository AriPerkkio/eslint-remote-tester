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
        validator({ ...DEFAULT_CONFIGURATION, repositories: undefined! });
        const [validationError] = getConsoleLogCalls();

        expect(validationError).toMatch('Configuration validation errors:');
        expect(validationError).toMatch('- Missing repositories.');
    });
});
