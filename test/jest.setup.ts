const actualLog = console.log;
const mockedLog = jest.fn();

const actualExit = process.exit;
const actualWrite = process.stdout.write;
const mockedExit = (jest.fn() as any) as typeof actualExit;
const mockedWrite = jest.fn();

beforeEach(() => {
    global.console.log = mockedLog;
    global.process.exit = mockedExit;
    global.process.stdout.write = mockedWrite;

    // Prevent word wrap
    global.process.stdout.columns = 9999;

    // Prevent ink from erasing the screen
    global.process.stdout.rows = 9999;
});

afterEach(async () => {
    global.console.log = actualLog;
    global.process.exit = actualExit;
    global.process.stdout.write = actualWrite;
});
