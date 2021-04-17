import fs from 'fs';
import { Jasmine } from 'jest-jasmine2/build/index.d';
import { Reporter } from 'jest-jasmine2/build/types.d';

import { clearResultsCache } from '../utils';

declare const jasmine: Jasmine;

jest.setTimeout(120000);

beforeEach(async () => {
    clearResultsCache();
});

const specDone: Reporter['specDone'] = async result => {
    if (result.status === 'failed') {
        const debugLog = '/tmp/test.debug.log';
        if (!fs.existsSync(debugLog)) return console.error('Debug log missing');

        const logContent = fs.readFileSync(debugLog, 'utf8');
        console.log(`Debug log content of "${result.description}"`, logContent);
    }
};

jasmine.getEnv().addReporter({ specDone });
