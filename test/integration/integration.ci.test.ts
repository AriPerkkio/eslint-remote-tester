import fs from 'fs';

import {
    runProductionBuild,
    INTEGRATION_REPO_OWNER,
    INTEGRATION_REPO_NAME,
    getStdoutWriteCalls,
} from '../utils';
import { CACHE_LOCATION } from '@file-client';

describe('CI mode', () => {
    beforeEach(async () => {
        await runProductionBuild();
    });

    test("validates repository's files", () => {
        const writes = getStdoutWriteCalls();
        const finalLog = writes.find(write => /Results:/.test(write));

        expect(finalLog).toMatchInlineSnapshot(`
            "
            Results:
            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
            Rule: no-undef
            Message: 'bar' is not defined.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1
            var foo = bar;

            if (foo) {
            }

            var p = {

            Rule: no-empty
            Message: Empty block statement.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L3-L4
            var foo = bar;

            if (foo) {
            }

            var p = {
                get name(){
                    // no returns.
                }

            Rule: getter-return
            Message: Expected to return a value in getter 'name'.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L7-L7
            if (foo) {
            }

            var p = {
                get name(){
                    // no returns.
                }
            };
            p.getName();


            Rule: no-compare-neg-zero
            Message: Do not use the '===' operator to compare against -0.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14
            };
            p.getName();


            if (foo === -0) {
              // prevent no-empty
            }

            "
        `);
    });

    test('excludes files matching exclude pattern', () => {
        const writes = getStdoutWriteCalls();
        const finalLog = writes.find(write => /Results:/.test(write));

        expect(finalLog).not.toMatch('expected-to-be-excluded');
    });

    test('progress is logged', () => {
        const repository = `${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}`;

        const [
            startMessage,
            cloneMessage,
            readMessage,
            lintStartMessage,
            lintDoneMessage,
            scanDoneMessage,
        ] = getStdoutWriteCalls().filter(call => /\[[A-Z]*\]/.test(call));

        expect(startMessage).toMatch(`[STARTING] ${repository}`);
        expect(cloneMessage).toMatch(`[CLONING] ${repository}`);
        expect(readMessage).toMatch(`[READING] ${repository}`);
        expect(lintStartMessage).toMatch(`[LINTING] ${repository} - 1 files`);
        expect(lintDoneMessage).toMatch(`[DONE] ${repository} 4 errors`);
        expect(scanDoneMessage).toMatch(
            `[DONE] Finished scan of 1 repositories`
        );
    });

    test('repositories are cached', async () => {
        const cachedRepository = `${CACHE_LOCATION}/${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}`;

        const writes = getStdoutWriteCalls();
        expect(writes.some(call => /CLONING/.test(call))).toBe(true);
        expect(fs.existsSync(cachedRepository)).toBe(true);

        await runProductionBuild();

        const secondRunWrites = getStdoutWriteCalls();
        expect(secondRunWrites.some(call => /CLONING/.test(call))).toBe(false);
        expect(secondRunWrites.some(call => /PULLING/.test(call))).toBe(true);
        expect(fs.existsSync(cachedRepository)).toBe(true);
    });
});
