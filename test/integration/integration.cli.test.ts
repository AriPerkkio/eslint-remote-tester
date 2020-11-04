import fs from 'fs';

import {
    INTEGRATION_REPO_NAME,
    runProductionBuild,
    INTEGRATION_REPO_OWNER,
    getStdoutWriteCalls,
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

        expect(results).toMatchInlineSnapshot(`
                "## Rule: no-undef
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
            [31m[DONE] AriPerkkio/eslint-remote-tester-integration-test-target 4 errors[39m
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
});
