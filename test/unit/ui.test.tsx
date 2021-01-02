import React from 'react';
import { render } from 'ink-testing-library';

import AppCLI from '@ui/components/AppCLI';
import { REFRESH_INTERVAL_MS } from '@ui/components/Tasks';
import ProgressLogger from '@progress-logger';
import { MockLoggerType } from '__mocks__/@progress-logger';

const MockLogger: MockLoggerType = ProgressLogger as any;

jest.unmock('@ui');

function flushRenderCycle() {
    jest.advanceTimersByTime(REFRESH_INTERVAL_MS);
}

describe('ui', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        MockLogger.resetMockListeners();
    });

    test('progress listeners are unsubscribed on unmount', () => {
        const { unmount } = render(<AppCLI isTTY />);

        expect(MockLogger.mockListeners.exit.length).toBeGreaterThan(0);
        expect(MockLogger.mockListeners.message.length).toBeGreaterThan(0);
        expect(MockLogger.mockListeners.task.length).toBeGreaterThan(0);

        unmount();

        expect(MockLogger.mockListeners.exit).toHaveLength(0);
        expect(MockLogger.mockListeners.message).toHaveLength(0);
        expect(MockLogger.mockListeners.task).toHaveLength(0);
    });

    test('non-TTY terminal is warned about <ScrollBox /> being disabled', () => {
        const { lastFrame } = render(<AppCLI isTTY={false} />);

        expect(lastFrame()).toMatch(
            'Terminal is not detected as TTY. Scrollbox is disabled.'
        );
    });

    test('tasks are rendered in 200ms intervals', () => {
        const { lastFrame } = render(<AppCLI isTTY />);

        MockLogger.mockTask({ repository: 'test-repo', step: 'START' });
        expect(lastFrame()).not.toMatch('test-repo');

        jest.advanceTimersByTime(199);
        expect(lastFrame()).not.toMatch('test-repo');

        jest.advanceTimersByTime(1);
        expect(lastFrame()).toMatch('test-repo');
    });

    test('complete tasks are removed from rendered output', () => {
        const { lastFrame } = render(<AppCLI isTTY />);

        MockLogger.mockTask({ repository: 'test-repo-1', step: 'START' });
        MockLogger.mockTask({ repository: 'test-repo-2', step: 'START' });
        flushRenderCycle();

        expect(lastFrame()).toMatch('test-repo-1');
        expect(lastFrame()).toMatch('test-repo-2');

        MockLogger.mockTask({ repository: 'test-repo-1', step: 'START' }, true);
        flushRenderCycle();

        expect(lastFrame()).not.toMatch('test-repo-1');
        expect(lastFrame()).toMatch('test-repo-2');
    });

    test("updates to existing task's repository do not create new tasks", () => {
        const { lastFrame } = render(<AppCLI isTTY />);
        function getTaskRows() {
            return lastFrame()!
                .split('\n')
                .filter(r => /\[[A-Z]*\]/.test(r));
        }

        // Adding initial repository should render new task
        MockLogger.mockTask({ repository: 'test-repo-1', step: 'START' });
        flushRenderCycle();
        expect(getTaskRows()).toHaveLength(1);

        // Adding second repository should render new task
        MockLogger.mockTask({ repository: 'test-repo-2', step: 'START' });
        flushRenderCycle();
        expect(getTaskRows()).toHaveLength(2);

        // Updating existing task should not create new task
        MockLogger.mockTask({ repository: 'test-repo-1', step: 'CLONE' });
        flushRenderCycle();
        expect(getTaskRows()).toHaveLength(2);
    });

    test('start of repository scanning is rendered', () => {
        const { lastFrame } = render(<AppCLI isTTY />);

        MockLogger.mockTask({ repository: 'test-repo', step: 'START' });
        flushRenderCycle();

        expect(lastFrame()).toMatch('[STARTING] test-repo');
    });

    test('start of linting is rendered', () => {
        const { lastFrame } = render(<AppCLI isTTY />);

        MockLogger.mockTask({
            repository: 'test-repo',
            step: 'LINT',
            fileCount: 2,
            currentFileIndex: 0,
        });
        flushRenderCycle();

        expect(lastFrame()).toMatch('[LINTING] test-repo - 2 files');
    });

    test('progress of linting is rendered', () => {
        const { lastFrame } = render(<AppCLI isTTY />);

        MockLogger.mockTask({
            repository: 'test-repo',
            step: 'LINT',
            fileCount: 5,
            currentFileIndex: 1,
        });
        flushRenderCycle();

        expect(lastFrame()).toMatch('[LINTING] test-repo - 1/5 files');
    });
});
