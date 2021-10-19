import Engine from '@engine';
import { Emitter } from '__mocks__/worker_threads';

jest.mock('worker_threads', () => require('./__mocks__/worker_threads'));
jest.unmock('@engine');

const REPOSITORY = 'test-repository';
const cleanup = jest.fn();
const workerCallback = jest.fn().mockReturnValue(cleanup);

afterEach(() => {
    Emitter.clear();
});

test('crashing worker is reported', async () => {
    const onMessage = jest.fn();
    const promise = Engine.scanRepository(
        REPOSITORY,
        onMessage,
        workerCallback
    );

    Emitter.emit('error', { code: 'mock-error' });

    expect(onMessage).toHaveBeenCalledWith({
        type: 'WORKER_ERROR',
        payload: 'mock-error',
    });

    expect(onMessage).toHaveBeenLastCalledWith({
        type: 'ON_RESULT',
        payload: {
            messages: [
                {
                    message: 'mock-error',
                    path: 'test-repository',
                    ruleId: '',
                    column: 0,
                    line: 0,
                    severity: 0,
                },
            ],
        },
    });

    await promise;
});

test('unexpected worker exits are reported', async () => {
    const onMessage = jest.fn();
    const promise = Engine.scanRepository(
        REPOSITORY,
        onMessage,
        workerCallback
    );

    Emitter.emit('exit', 987);

    expect(onMessage).toHaveBeenCalledWith({
        payload: {
            messages: [
                {
                    message: 'Worker exited with code 987',
                    path: 'test-repository',
                    ruleId: '',
                    column: 0,
                    line: 0,
                    severity: 0,
                },
            ],
        },
        type: 'ON_RESULT',
    });

    await promise;
});
