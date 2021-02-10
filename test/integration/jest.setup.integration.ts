import fs from 'fs';
import { Jasmine } from 'jest-jasmine2/build/index.d';
import { Reporter } from 'jest-jasmine2/build/types.d';

import { clearResultsCache } from '../utils';

declare const jasmine: Jasmine;

// Extend timeout due to actual git clone
jest.setTimeout(15000);

beforeEach(async () => {
    clearResultsCache();

    // Timeout between tests - otherwise constant `git clone` calls start failing
    await new Promise(r => setTimeout(r, 2000));
});

const specDone: Reporter['specDone'] = async result => {
    if (result.status === 'failed') {
        const debugLog = '/tmp/integration.test.debug.log';
        if (!fs.existsSync(debugLog)) return console.error('Debug log missing');

        const logContent = fs.readFileSync(debugLog, 'utf8');
        console.log(`Debug log content of "${result.description}"`, logContent);
    }
};

jasmine.getEnv().addReporter({ specDone });
