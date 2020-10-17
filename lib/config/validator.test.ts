import validator from './validator';
import { Config } from './types';

// TODO Create global jest setup
const actualConsole = console;
const mockedConsole: Console = { ...console, log: jest.fn() };
const actualProcess = process;
const mockedProcess: NodeJS.Process = {
    ...actualProcess,
    exit: jest.fn(),
} as any;

const DEFAULT_CONFIGURATION: Config = {
    repositories: ['test-repo'],
    extensions: ['.ts', '.tsx'],
    pathIgnorePattern: undefined,
    rulesUnderTesting: [],
    resultParser: 'plaintext',
    concurrentTasks: undefined as any,
    eslintrc: {},
    CI: undefined as any,
};

describe('Config validator', () => {
    beforeEach(() => {
        global.console = mockedConsole;
        global.process = mockedProcess;
    });

    afterEach(async () => {
        global.console = actualConsole;
        global.process = actualProcess;
    });
    test('repositories are required', () => {
        validator({ ...DEFAULT_CONFIGURATION, repositories: undefined! });
        const [[validationError]] = (console.log as jest.Mock).mock.calls;

        expect(validationError).toMatch('Configuration validation errors:');
        expect(validationError).toMatch('- Missing repositories.');
    });
});
