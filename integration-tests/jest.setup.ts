import { waitFor, setConfig } from './utils';

const isWatchMode = process.argv.find(arg => arg === '--watch');

global.beforeAll(() => {
    if (isWatchMode) {
        require('child_process').execSync('yarn build');
    }

    setConfig();
});

const actualConsole = console;
const mockedConsole: Console = { ...console, log: jest.fn() };
const actualProcess = process;
const mockedProcess: NodeJS.Process = {
    ...actualProcess,
    exit: jest.fn(),
    stdout: {
        ...actualProcess.stdout,
        write: jest.fn(),
        on: jest.fn(),
        cursorTo: jest.fn(),
        clearLine: jest.fn(),
    },
} as any;

global.beforeEach(() => {
    global.console = mockedConsole;
    global.process = mockedProcess;
});

global.afterEach(async () => {
    await waitFor(() =>
        [
            ...(process.stdout.write as jest.Mock).mock.calls,
            ...(console.log as jest.Mock).mock.calls,
        ].some(call => /Finished/.test(call))
    );

    global.console = actualConsole;
    global.process = actualProcess;
});
