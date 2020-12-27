import config, { validateConfig } from '@config';
import { renderApplication } from '@ui';

jest.mock('@config');
jest.mock('@ui');
jest.mock('@engine');
jest.mock('@file-client');
jest.mock('@progress-logger');

describe('entrypoint', () => {
    beforeEach(async () => {
        await require('../../lib/index').__handleForTests;
    });

    test('configuration is validated', () => {
        expect(validateConfig).toHaveBeenCalledWith(config);
        expect(validateConfig).toHaveBeenCalledTimes(1);
    });

    test('application is rendered', () => {
        expect(renderApplication).toHaveBeenCalledTimes(1);
    });

    test.todo('previous results are cleared');
    test.todo('repositories are scanned in sets of config.concurrentTasks');
    test.todo('scanning is interrupted once logger indicates timeout');
    test.todo('scan completion is logged');
    test.todo('start of task is logged');
    test.todo('repository reading is logged');
    test.todo('repository cloning is logged');
    test.todo('repository pulling is logged');
    test.todo('start of lint is logged');
    test.todo('end of lint is logged');
    test.todo('slow lint is logged');
    test.todo('linter crash is logged');
    test.todo('worker error is logged');
    test.todo('repository clone failure is logged');
    test.todo('repository pull failure is logged');
    test.todo('file reading failure is logged');
    test.todo('workers are terminated on logger timeout');
    test.todo('results are written');
    test.todo('result writing failure is logged');
    test.todo('end of linting is logged');
});
