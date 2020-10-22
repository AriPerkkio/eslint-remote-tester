import fs from 'fs';
import {
    getConsoleLogCalls,
    runProductionBuild,
    setConfig,
    CI_CONFIGURATION_LOCATION,
    INTEGRATION_REPO_OWNER,
    INTEGRATION_REPO_NAME,
} from '../utils';
import { CACHE_LOCATION } from '@file-client';

describe('CI mode', () => {
    beforeEach(async () => {
        setConfig(CI_CONFIGURATION_LOCATION);
        await runProductionBuild();
    });

    test("validates repository's files", () => {
        const finalLogCall = getConsoleLogCalls().pop();

        expect(finalLogCall).toMatchInlineSnapshot(`
            "Results:
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
        const finalLog = getConsoleLogCalls().pop();

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
        ] = getConsoleLogCalls();

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

        const [, cloneMessage] = getConsoleLogCalls();
        expect(cloneMessage).toMatch('[CLONING]');
        expect(fs.existsSync(cachedRepository)).toBe(true);

        await runProductionBuild();

        const [, pullMessage] = getConsoleLogCalls();
        expect(pullMessage).toMatch('[PULLING]');
        expect(fs.existsSync(cachedRepository)).toBe(true);
    });
});
