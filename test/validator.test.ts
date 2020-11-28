import { getConsoleLogCalls } from './utils';
import validator from '@config/validator';
import { Config } from '@config/types';

const DEFAULT_CONFIGURATION: Config = {
    repositories: ['test-repo'],
    extensions: ['.ts', '.tsx'],
    pathIgnorePattern: undefined,
    rulesUnderTesting: [],
    resultParser: 'plaintext',
    concurrentTasks: undefined as any,
    eslintrc: {},
    CI: undefined as any,
    cache: undefined as any,
};

describe('Config validator', () => {
    test('repositories are required', () => {
        validator({ ...DEFAULT_CONFIGURATION, repositories: undefined! });
        const [validationError] = getConsoleLogCalls();

        expect(validationError).toMatch('Configuration validation errors:');
        expect(validationError).toMatch('- Missing repositories.');
    });
});
