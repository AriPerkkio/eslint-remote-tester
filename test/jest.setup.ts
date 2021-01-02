declare const global: typeof globalThis & {
    onComplete: jest.Mock;
    consolelog: any;
};
declare const console: { log: jest.Mock };
declare const process: {
    stdout: { write: jest.Mock; rows: number; columns: number };
    exit: jest.Mock;
};

const actualLog = console.log;
const mockedLog = jest.fn();
const actualExit = process.exit;
const actualWrite = process.stdout.write;
const mockedExit = jest.fn();
const mockedWrite = jest.fn();

global.consolelog = (msg: string) => actualWrite(`\n${msg}\n\n`);
global.onComplete = jest.fn();

global.beforeAll(() => {
    console.log = mockedLog;
    process.exit = mockedExit;
    process.stdout.write = mockedWrite;

    // Prevent word wrap
    process.stdout.columns = 9999;

    // Prevent ink from erasing the screen
    process.stdout.rows = 9999;
});

global.afterAll(() => {
    console.log = actualLog;
    process.exit = actualExit;
    process.stdout.write = actualWrite;
});

global.beforeEach(() => {
    process.stdout.write.mockClear();
    console.log.mockClear();
    process.exit.mockClear();
    global.onComplete.mockClear();
});

export {};
