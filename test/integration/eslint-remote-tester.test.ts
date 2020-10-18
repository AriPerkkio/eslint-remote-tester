import { setConfig, CI_CONFIGURATION_LOCATION } from '../utils';

describe('eslint-remote-tester', () => {
    describe('CLI', () => {
        test("doesn't crash", async () => {
            const { __handleForTests } = require('../../dist/index');
            await __handleForTests;
        });

        test.todo('creates results file');
        test.todo("validates repository's files");
        test.todo('excludes files matching exclude pattern');
    });

    describe('CI mode', () => {
        beforeEach(() => {
            setConfig(CI_CONFIGURATION_LOCATION);
        });

        test("doesn't crash", async () => {
            const { __handleForTests } = require('../../dist/index');
            await __handleForTests;
        });

        test.todo('logs results');
        test.todo("validates repository's files");
        test.todo('excludes files matching exclude pattern');
    });
});
