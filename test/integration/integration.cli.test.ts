import fs from 'fs';

import {
    INTEGRATION_REPO_NAME,
    runProductionBuild,
    INTEGRATION_REPO_OWNER,
    getStdoutWriteCalls,
    sanitizeStackTrace,
    getOnCompleteCalls,
} from '../utils';
import { RESULTS_LOCATION, CACHE_LOCATION } from '@file-client';

const RESULTS_FILE = `${INTEGRATION_REPO_OWNER}_${INTEGRATION_REPO_NAME}.md`;

describe('CLI', () => {
    beforeEach(async () => {
        await runProductionBuild();
    });

    test('creates results file', () => {
        const files = fs.readdirSync(RESULTS_LOCATION);

        expect(files).toHaveLength(1);
        expect(files[0]).toMatch(RESULTS_FILE);
    });

    test("validates repository's files", () => {
        const results = fs.readFileSync(
            `${RESULTS_LOCATION}/${RESULTS_FILE}`,
            'utf8'
        );

        expect(sanitizeStackTrace(results)).toMatchInlineSnapshot(`
            "## Rule: unable-to-parse-rule-id
            - Message: \`Cannot read property 'someAttribute' of undefined
            Occurred while linting <text>:2\`
            - Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js\`
            - [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2)
            \`\`\`js
            // Identifier.name = attributeForCrashing
            window.attributeForCrashing();

            \`\`\`
            \`\`\`
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
            \`\`\`
            ## Rule: no-undef
            - Message: \`'bar' is not defined.\`
            - Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            - [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1)
            \`\`\`js
            var foo = bar;

            if (foo) {
            }

            var p = {
            \`\`\`

            ## Rule: no-empty
            - Message: \`Empty block statement.\`
            - Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            - [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L3-L4)
            \`\`\`js
            var foo = bar;

            if (foo) {
            }

            var p = {
                get name(){
                    // no returns.
                }
            \`\`\`

            ## Rule: getter-return
            - Message: \`Expected to return a value in getter 'name'.\`
            - Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            - [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L7-L7)
            \`\`\`js
            if (foo) {
            }

            var p = {
                get name(){
                    // no returns.
                }
            };
            p.getName();

            \`\`\`

            ## Rule: no-compare-neg-zero
            - Message: \`Do not use the '===' operator to compare against -0.\`
            - Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            - [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14)
            \`\`\`js
            };
            p.getName();


            if (foo === -0) {
              // prevent no-empty
            }
            \`\`\`
            "
        `);
    });

    test('excludes files matching exclude pattern', () => {
        const results = fs.readFileSync(
            `${RESULTS_LOCATION}/${RESULTS_FILE}`,
            'utf8'
        );

        expect(results).not.toMatch('expected-to-be-excluded');
    });

    // TODO testing this is really tricky with current setup
    // - process.stdout.write is called on intervals
    // - Replace interval with direct calls
    test.todo('progress is displayed on terminal');

    test('final log is logged on terminal', () => {
        const writes = getStdoutWriteCalls();
        const finalLog = writes.find(write => /Full log:/.test(write));

        expect(finalLog).toMatchInlineSnapshot(`
            "[33mFull log:[39m
            [31m[ERROR] AriPerkkio/eslint-remote-tester-integration-test-target crashed: unable-to-parse-rule-id[39m
            [31m[ERROR] AriPerkkio/eslint-remote-tester-integration-test-target 5 errors[39m
            [32m[DONE] Finished scan of 1 repositories[39m
            "
        `);
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
