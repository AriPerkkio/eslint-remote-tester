import fs from 'fs';

import {
    runProductionBuild,
    INTEGRATION_REPO_OWNER,
    INTEGRATION_REPO_NAME,
    getStdoutWriteCalls,
    sanitizeStackTrace,
    getOnCompleteCalls,
} from '../utils';
import { CACHE_LOCATION } from '@file-client';

describe('CI mode', () => {
    beforeEach(async () => {
        await runProductionBuild();
    });

    test("validates repository's files", () => {
        const writes = getStdoutWriteCalls();
        const finalLog = writes.find(write => /Results:/.test(write));

        expect(sanitizeStackTrace(finalLog)).toMatchInlineSnapshot(`
            "
            Results:
            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
            Rule: unable-to-parse-rule-id
            Message: Cannot read property 'someAttribute' of undefined
            Occurred while linting <text>:2
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2

            // Identifier.name = attributeForCrashing
            window.attributeForCrashing();


            Error:
            TypeError: Cannot read property 'someAttribute' of undefined
            Occurred while linting <text>:2
                at Identifier (<removed>/eslint-local-rules.js:21:56)
                at <removed>/node_modules/eslint/lib/linter/safe-emitter.js:45:58
                at Array.forEach (<anonymous>)
                at Object.emit (<removed>/node_modules/eslint/lib/linter/safe-emitter.js:45:38)
                at NodeEventGenerator.applySelector (<removed>/node_modules/eslint/lib/linter/node-event-generator.js:254:26)
                at NodeEventGenerator.applySelectors (<removed>/node_modules/eslint/lib/linter/node-event-generator.js:283:22)
                at NodeEventGenerator.enterNode (<removed>/node_modules/eslint/lib/linter/node-event-generator.js:297:14)
                at CodePathAnalyzer.enterNode (<removed>/node_modules/eslint/lib/linter/code-path-analysis/code-path-analyzer.js:711:23)
                at <removed>/node_modules/eslint/lib/linter/linter.js:952:32
                at Array.forEach (<anonymous>)

            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
            Rule: no-undef
            Message: 'bar' is not defined.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1

            var foo = bar;

            if (foo) {
            }

            var p = {

            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
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

            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
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


            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
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
            lintCrashMessage,
            lintDoneMessage,
            scanDoneMessage,
        ] = getStdoutWriteCalls().filter(call => /\[[A-Z]*\]/.test(call));

        expect(startMessage).toMatch(`[STARTING] ${repository}`);
        expect(cloneMessage).toMatch(`[CLONING] ${repository}`);
        expect(readMessage).toMatch(`[READING] ${repository}`);
        expect(lintStartMessage).toMatch(`[LINTING] ${repository} - 2 files`);
        expect(lintCrashMessage).toMatch(`[ERROR] ${repository} crashed`);
        expect(lintDoneMessage).toMatch(`[ERROR] ${repository} 5 errors`);
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

    test('exits process with error code', async () => {
        expect(process.exit).toHaveBeenCalledWith(1);
    });

    test('calls onComplete hook with the results', async () => {
        const [onCompleteCalls] = getOnCompleteCalls();
        const [result] = onCompleteCalls;

        expect(result.extension).toBe('js');
        expect(result.link).toBe(
            `https://github.com/${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}/blob/HEAD/expected-to-crash-linter.js#L2`
        );
        expect(result.rule).toBe('unable-to-parse-rule-id');
        expect(result.message).toBe(
            "Cannot read property 'someAttribute' of undefined\nOccurred while linting <text>:2"
        );
        expect(result.path).toBe(
            `${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}/expected-to-crash-linter.js`
        );
        expect(result.error).toBeTruthy();

        // Each result should have attributes defined
        onCompleteCalls.forEach(result => {
            expect(result.repository).toBeTruthy();
            expect(result.repositoryOwner).toBeTruthy();
            expect(result.rule).toBeTruthy();
            expect(result.message).toBeTruthy();
            expect(result.path).toBeTruthy();
            expect(result.link).toBeTruthy();
            expect(result.extension).toBeTruthy();
            expect(result.source).toBeTruthy();
        });
    });
});
