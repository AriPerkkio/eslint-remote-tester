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

    test('start of linting is rendered', async () => {
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

    test('progress of linting is rendered', async () => {
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
