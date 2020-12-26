import ProgressLogger from '@progress-logger';
import { LogMessage } from '@progress-logger/types';
import config from '@config';

jest.mock('@config');
jest.mock('@file-client');

function getLogger(): typeof ProgressLogger {
    jest.resetModules();

    return require('../../lib/progress-logger').default;
}

describe('progress-logger', () => {
    test('listeners are notified about new messages', () => {
        const onMessage = jest.fn();
        const message: LogMessage = { content: 'A', level: 'warn' };
        const logger = getLogger();

        logger.on('message', onMessage);
        logger.addNewMessage(message);

        expect(onMessage).toHaveBeenCalledWith(message);
    });

    test('messages are filterd by config.logLevel', () => {
        expect(config.logLevel).toBe('warn');

        const onMessage = jest.fn();
        const message: LogMessage = { content: 'A', level: 'info' };
        const logger = getLogger();

        logger.on('message', onMessage);
        logger.addNewMessage(message);

        expect(onMessage).not.toHaveBeenCalled();
    });
});
