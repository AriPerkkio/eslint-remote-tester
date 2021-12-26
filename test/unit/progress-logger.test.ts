import ProgressLogger from '@progress-logger';
import { LogMessage } from '@progress-logger/types';
import { mockConfigValue, restoreMockConfig } from '__mocks__/@config';
import { getLastCallArguments } from '../utils';

jest.unmock('@progress-logger');

// TODO: Use once isolateModules works with jest@27
// let ProgressLogger: typeof ActualProgressLogger;

beforeEach(() => {
    restoreMockConfig();

    // TODO: Use once isolateModules works with jest@27
    // jest.isolateModules(() => {
    //     ProgressLogger = require('../../lib/progress-logger').default;
    // });
});

afterEach(() => {
    // TODO Remove once isolateModules works with jest@27
    (ProgressLogger as any).messages = [];
    (ProgressLogger as any).tasks = [];
    (ProgressLogger as any).scannedRepositories = 0;
    (ProgressLogger as any).errorCount = 0;
    (ProgressLogger as any).listeners = {
        exit: [],
        message: [],
        task: [],
        ciKeepAlive: [],
        timeout: [],
    };
});

test('listeners are notified about new messages', () => {
    const onMessage = jest.fn();
    const message: LogMessage = { content: 'A', level: 'warn' };

    ProgressLogger.on('message', onMessage);
    ProgressLogger.addNewMessage(message);

    expect(onMessage).toHaveBeenCalledWith(message);
});

test('messages are filtered by config.logLevel', () => {
    mockConfigValue({ logLevel: 'warn' });

    const onMessage = jest.fn();
    const message: LogMessage = { content: 'A', level: 'info' };

    ProgressLogger.on('message', onMessage);
    ProgressLogger.addNewMessage(message);

    expect(onMessage).not.toHaveBeenCalled();
});

test('ci status messages include repositories and error count', () => {
    // Expected to affect repository count in status message
    mockConfigValue({ repositories: ['1', '2', '3', '4', '5'] });

    const onCiKeepAlive = jest.fn();
    ProgressLogger.on('ciKeepAlive', onCiKeepAlive);

    ProgressLogger.onLintEnd('mock-repository', 5);
    ProgressLogger.onCiStatus();

    expect(getLastCallArguments(onCiKeepAlive)).toMatchInlineSnapshot(`
        "[INFO/STATUS] Repositories (1/5)
        [INFO/STATUS] Errors (5)

        "
    `);
});

test('ci status messages include current tasks', () => {
    const onCiKeepAlive = jest.fn();
    ProgressLogger.on('ciKeepAlive', onCiKeepAlive);

    ProgressLogger.onLintStart('repository-one', 12);
    ProgressLogger.onRepositoryClone('repository-two');
    ProgressLogger.onRepositoryRead('repository-three');
    ProgressLogger.onRepositoryPull('repository-four');
    ProgressLogger.onCiStatus();

    expect(getLastCallArguments(onCiKeepAlive)).toMatchInlineSnapshot(`
        "[INFO/STATUS] Repositories (0/3)
        [INFO/STATUS] Errors (0)
        [INFO/LINTING] repository-one - 12 files
        [INFO/CLONING] repository-two
        [INFO/READING] repository-three
        [INFO/PULLING] repository-four
        "
    `);
});
