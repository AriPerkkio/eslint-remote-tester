import ProgressLogger from '@progress-logger';
import { LogMessage } from '@progress-logger/types';
import { mockConfig } from '__mocks__/@config';

jest.unmock('@progress-logger');

describe('progress-logger', () => {
    test('listeners are notified about new messages', () => {
        const onMessage = jest.fn();
        const message: LogMessage = { content: 'A', level: 'warn' };

        ProgressLogger.on('message', onMessage);
        ProgressLogger.addNewMessage(message);

        expect(onMessage).toHaveBeenCalledWith(message);
    });

    test('messages are filterd by config.logLevel', () => {
        mockConfig.mockReturnValue({ logLevel: 'warn' });

        const onMessage = jest.fn();
        const message: LogMessage = { content: 'A', level: 'info' };

        ProgressLogger.on('message', onMessage);
        ProgressLogger.addNewMessage(message);

        expect(onMessage).not.toHaveBeenCalled();
    });
});
