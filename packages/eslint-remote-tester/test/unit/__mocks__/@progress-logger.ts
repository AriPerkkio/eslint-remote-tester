import {
    Listeners,
    ListenerType,
    LogMessage,
    Task,
} from '@progress-logger/types';

class MockLogger {
    isTimeout = jest.fn().mockReturnValue(false);
    onAllRepositoriesScanned = jest.fn();
    onTaskStart = jest.fn();
    onRepositoryRead = jest.fn();
    onRepositoryClone = jest.fn();
    onRepositoryPull = jest.fn();
    onLintStart = jest.fn();
    onFileLintEnd = jest.fn();
    onFileLintSlow = jest.fn();
    onLinterCrash = jest.fn();
    onWorkerCrash = jest.fn();
    onCloneFailure = jest.fn();
    onPullFailure = jest.fn();
    onReadFailure = jest.fn();
    onWriteFailure = jest.fn();
    onLintEnd = jest.fn();
    onCacheStatus = jest.fn();

    on = jest.fn().mockImplementation((event: ListenerType, listener) => {
        const eventListeners = this.mockListeners[event];
        eventListeners && eventListeners.push(listener);
    });

    off = jest.fn().mockImplementation((event: ListenerType, listener) => {
        const eventListeners: any = this.mockListeners[event];

        if (eventListeners) {
            this.mockListeners[event] = eventListeners.filter(
                (l: any) => l !== listener
            );
        }
    });

    mockListeners: Listeners = {
        exit: [],
        message: [],
        task: [],
        ciKeepAlive: [],
        timeout: [],
    };
    resetMockListeners = () => {
        this.mockListeners = {
            exit: [],
            message: [],
            task: [],
            ciKeepAlive: [],
            timeout: [],
        };
    };

    mockTask = (task: Task, done?: boolean) =>
        this.mockListeners.task.forEach(listener => listener(task, done));

    mockMessage = (message: LogMessage) =>
        this.mockListeners.message.forEach(listener => listener(message));
}

module.exports = {
    __esModule: true,
    ...jest.requireActual('@progress-logger'),
    default: new MockLogger(),
};

export type MockLoggerType = MockLogger;
