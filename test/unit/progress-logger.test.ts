import ProgressLogger from '@progress-logger';
import { LogMessage } from '@progress-logger/types';

const config = jest.fn().mockReturnValue({ logLevel: 'verbose' });
jest.mock('@config', () => config());

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
        config.mockReturnValueOnce({ logLevel: 'warn' });

        const onMessage = jest.fn();
        const message: LogMessage = { content: 'A', level: 'info' };
        const logger = getLogger();

        logger.on('message', onMessage);
        logger.addNewMessage(message);

        expect(onMessage).not.toHaveBeenCalled();
    });
});
