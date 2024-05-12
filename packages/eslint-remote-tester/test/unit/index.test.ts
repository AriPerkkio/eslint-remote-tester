import config, { validateConfig } from '@config';
import { renderApplication } from '@ui';
import { prepareResultsDirectory } from '@file-client';

beforeEach(async () => {
    await require('../../src/index').__handleForTests;
});

test('configuration is validated', () => {
    expect(validateConfig).toHaveBeenCalledWith(config);
    expect(validateConfig).toHaveBeenCalledTimes(1);
});

test('application is rendered', () => {
    expect(renderApplication).toHaveBeenCalledTimes(1);
});

test('results directory is prepared', () => {
    expect(prepareResultsDirectory).toHaveBeenCalledTimes(1);
});

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
