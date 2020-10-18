import { waitFor, setConfig } from '../utils';

// Extend timeout due to actual git clone
jest.setTimeout(10000);

const isWatchMode = process.argv.find(arg => arg === '--watch');

beforeAll(() => {
    if (isWatchMode) {
        require('child_process').execSync('yarn build');
    }

    setConfig();
});

afterEach(async () => {
    await waitFor(() =>
        [
            ...(process.stdout.write as jest.Mock).mock.calls,
            ...(console.log as jest.Mock).mock.calls,
        ].some(call => /Finished/.test(call))
    );
});
