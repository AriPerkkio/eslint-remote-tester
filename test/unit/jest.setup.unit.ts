import { restoreMockConfig } from '__mocks__/@config';

declare const console: { log: jest.Mock };
declare const process: { exit: jest.Mock };

const actualExit = process.exit;
const mockedExit = jest.fn();
const actualLog = console.log;
const mockedLog = jest.fn().mockImplementation((...args) => {
    // Support calling console.log when developing tests, e.g. console.log('DEBUG', 'actual log')
    if (args[0] === 'DEBUG') {
        actualLog(args[1]);
    }
});

global.beforeAll(() => {
    process.exit = mockedExit;
    console.log = mockedLog;
});

global.afterAll(() => {
    process.exit = actualExit;
    console.log = actualLog;
});

global.beforeEach(() => {
    restoreMockConfig();
    process.exit.mockClear();
    console.log.mockClear();
});

export {};
