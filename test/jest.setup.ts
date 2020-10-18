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

beforeEach(() => {
    global.console = mockedConsole;
    global.process = mockedProcess;
});

afterEach(async () => {
    global.console = actualConsole;
    global.process = actualProcess;
});
