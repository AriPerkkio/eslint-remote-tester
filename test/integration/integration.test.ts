import fs from 'fs';

import {
    getResults,
    getComparisonResults,
    runProductionBuild,
    INTEGRATION_REPO_OWNER,
    INTEGRATION_REPO_NAME,
    REPOSITORY_CACHE,
} from '../utils';

describe('integration', () => {
    test('results are rendered on CI mode', async () => {
        const { output } = await runProductionBuild({ CI: true });
        const finalLog = output.pop();

        expect(finalLog).toMatchInlineSnapshot(`
            "Results:
            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
            Rule: unable-to-parse-rule-id
            Message: Cannot read property 'someAttribute' of undefined
            Occurred while linting <text>:2
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2

              1 | // Identifier.name = attributeForCrashing
            > 2 | window.attributeForCrashing();
              3 |

            Error:
            TypeError: Cannot read property 'someAttribute' of undefined
            Occurred while linting <text>:2
                at Identifier (<removed>/eslint-local-rules.js:22:56)
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

            > 1 | var foo = bar;
                |           ^^^
              2 |
              3 | if (foo) {
              4 | }

            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
            Rule: no-empty
            Message: Empty block statement.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L3-L4

              1 | var foo = bar;
              2 |
            > 3 | if (foo) {
                |          ^
            > 4 | }
                | ^^
              5 |
              6 | var p = {
              7 |     get name(){

            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
            Rule: getter-return
            Message: Expected to return a value in getter 'name'.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L7-L7

               5 |
               6 | var p = {
            >  7 |     get name(){
                 |     ^^^^^^^^
               8 |         // no returns.
               9 |     }
              10 | };

            Repository: AriPerkkio/eslint-remote-tester-integration-test-target
            Rule: no-compare-neg-zero
            Message: Do not use the '===' operator to compare against -0.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14

              12 |
              13 |
            > 14 | if (foo === -0) {
                 |     ^^^^^^^^^^
              15 |   // prevent no-empty
              16 | }


            "
        `);
    });

    test('results are written to file system on CLI mode', async () => {
        await runProductionBuild({ CI: false });
        const results = getResults();

        expect(results).toMatchInlineSnapshot(`
            "## Rule: unable-to-parse-rule-id

            -   Message: \`Cannot read property 'someAttribute' of undefined Occurred while linting <text>:2\`
            -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js\`
            -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2)

            \`\`\`js
              1 | // Identifier.name = attributeForCrashing
            > 2 | window.attributeForCrashing();
              3 |
            \`\`\`

            \`\`\`
            TypeError: Cannot read property 'someAttribute' of undefined
            Occurred while linting <text>:2
                at Identifier (<removed>/eslint-local-rules.js:22:56)
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

            -   Message: \`'bar' is not defined.\`
            -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1)

            \`\`\`js
            > 1 | var foo = bar;
                |           ^^^
              2 |
              3 | if (foo) {
              4 | }
            \`\`\`

            ## Rule: no-empty

            -   Message: \`Empty block statement.\`
            -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L3-L4)

            \`\`\`js
              1 | var foo = bar;
              2 |
            > 3 | if (foo) {
                |          ^
            > 4 | }
                | ^^
              5 |
              6 | var p = {
              7 |     get name(){
            \`\`\`

            ## Rule: getter-return

            -   Message: \`Expected to return a value in getter 'name'.\`
            -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L7-L7)

            \`\`\`js
               5 |
               6 | var p = {
            >  7 |     get name(){
                 |     ^^^^^^^^
               8 |         // no returns.
               9 |     }
              10 | };
            \`\`\`

            ## Rule: no-compare-neg-zero

            -   Message: \`Do not use the '===' operator to compare against -0.\`
            -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14)

            \`\`\`js
              12 |
              13 |
            > 14 | if (foo === -0) {
                 |     ^^^^^^^^^^
              15 |   // prevent no-empty
              16 | }
            \`\`\`
            "
        `);
    });

    test('final log is rendered on CLI mode', async () => {
        const { output } = await runProductionBuild({ CI: false });
        const finalLog = output.pop();

        expect(finalLog).toMatchInlineSnapshot(`
            "Full log:
            [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target crashed: unable-to-parse-rule-id
            [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target 5 errors
            [DONE] Finished scan of 1 repositories

            "
        `);
    });

    test('excludes files matching exclude pattern', async () => {
        const { output } = await runProductionBuild({ CI: true });
        const finalLog = output.pop();

        expect(finalLog).not.toMatch('expected-to-be-excluded');
    });

    test('repositories are cached', async () => {
        const cleanRun = await runProductionBuild();

        expect(cleanRun.output.some(row => /CLONING/.test(row))).toBe(true);
        expect(fs.existsSync(REPOSITORY_CACHE)).toBe(true);

        const cachedRun = await runProductionBuild();

        expect(cachedRun.output.some(row => /CLONING/.test(row))).toBe(false);
        expect(cachedRun.output.some(row => /PULLING/.test(row))).toBe(true);
        expect(fs.existsSync(REPOSITORY_CACHE)).toBe(true);
    });

    test('repository caching can be disabled', async () => {
        await runProductionBuild({ cache: false });

        expect(fs.existsSync(REPOSITORY_CACHE)).toBe(false);
    });

    // TODO: How to mock setTimeout calls when process is not ran by Jest
    test.todo('progress is displayed on CLI mode');

    test('progress is displayed on CI mode', async () => {
        const { output } = await runProductionBuild({ CI: true });
        const repository = `${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}`;

        const [
            startMessage,
            cloneMessage,
            readMessage,
            lintStartMessage,
            lintCrashMessage,
            lintDoneMessage,
            scanDoneMessage,
        ] = output;

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

    test('resultParser option is used on CI mode', async () => {
        const { output } = await runProductionBuild({
            CI: true,
            resultParser: 'markdown',
        });

        const finalLog = output.pop();

        expect(finalLog).toMatch('## Rule');
    });

    test('resultParser option is used on CLI mode', async () => {
        await runProductionBuild({ CI: false, resultParser: 'plaintext' });

        const results = getResults('');

        expect(results).toMatch('Rule');
        expect(results).not.toMatch('## Rule');
    });

    test('erroneous scan exits with error code', async () => {
        const { exitCode } = await runProductionBuild();

        expect(exitCode).toBe(1);
    });

    test('successful scan exits without error code', async () => {
        const { exitCode } = await runProductionBuild({
            rulesUnderTesting: [],
            eslintrc: {
                root: true,
                extends: ['eslint:recommended'],
            },
        });

        expect(exitCode).toBe(0);
    });

    test('calls onComplete hook with the results', async () => {
        const { output } = await runProductionBuild({
            CI: true,
            onComplete: function onComplete(results) {
                console.log('[TEST-ON-COMPLETE-START]');

                results.forEach(result => {
                    Object.entries(result).forEach(([key, value]) => {
                        if (key === '__internalHash') return;
                        const block = `[${key.toUpperCase()}]`;

                        console.log('.');
                        console.log(block);
                        console.log(value);
                        console.log(block);
                    });
                });

                console.log('[TEST-ON-COMPLETE-END]');
            },
        });

        const [onCompleteCall] = output
            .join('\n')
            .match(
                /\[TEST-ON-COMPLETE-START\]([\s|\S]*)\[TEST-ON-COMPLETE-END\]/
            )!;

        expect(onCompleteCall).toMatchInlineSnapshot(`
            "[TEST-ON-COMPLETE-START]
            .
            [REPOSITORY]
            eslint-remote-tester-integration-test-target
            [REPOSITORY]
            .
            [REPOSITORYOWNER]
            AriPerkkio
            [REPOSITORYOWNER]
            .
            [RULE]
            unable-to-parse-rule-id
            [RULE]
            .
            [MESSAGE]
            Cannot read property 'someAttribute' of undefined
            Occurred while linting <text>:2
            [MESSAGE]
            .
            [PATH]
            AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
            [PATH]
            .
            [LINK]
            https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2
            [LINK]
            .
            [EXTENSION]
            js
            [EXTENSION]
            .
            [SOURCE]
              1 | // Identifier.name = attributeForCrashing
            > 2 | window.attributeForCrashing();
              3 |
            [SOURCE]
            .
            [ERROR]
            TypeError: Cannot read property 'someAttribute' of undefined
            Occurred while linting <text>:2
                at Identifier (<removed>/eslint-local-rules.js:22:56)
                at <removed>/node_modules/eslint/lib/linter/safe-emitter.js:45:58
                at Array.forEach (<anonymous>)
                at Object.emit (<removed>/node_modules/eslint/lib/linter/safe-emitter.js:45:38)
                at NodeEventGenerator.applySelector (<removed>/node_modules/eslint/lib/linter/node-event-generator.js:254:26)
                at NodeEventGenerator.applySelectors (<removed>/node_modules/eslint/lib/linter/node-event-generator.js:283:22)
                at NodeEventGenerator.enterNode (<removed>/node_modules/eslint/lib/linter/node-event-generator.js:297:14)
                at CodePathAnalyzer.enterNode (<removed>/node_modules/eslint/lib/linter/code-path-analysis/code-path-analyzer.js:711:23)
                at <removed>/node_modules/eslint/lib/linter/linter.js:952:32
                at Array.forEach (<anonymous>)
            [ERROR]
            .
            [REPOSITORY]
            eslint-remote-tester-integration-test-target
            [REPOSITORY]
            .
            [REPOSITORYOWNER]
            AriPerkkio
            [REPOSITORYOWNER]
            .
            [RULE]
            no-undef
            [RULE]
            .
            [MESSAGE]
            'bar' is not defined.
            [MESSAGE]
            .
            [PATH]
            AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            [PATH]
            .
            [LINK]
            https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1
            [LINK]
            .
            [EXTENSION]
            js
            [EXTENSION]
            .
            [SOURCE]
            > 1 | var foo = bar;
                |           ^^^
              2 |
              3 | if (foo) {
              4 | }
            [SOURCE]
            .
            [ERROR]
            undefined
            [ERROR]
            .
            [REPOSITORY]
            eslint-remote-tester-integration-test-target
            [REPOSITORY]
            .
            [REPOSITORYOWNER]
            AriPerkkio
            [REPOSITORYOWNER]
            .
            [RULE]
            no-empty
            [RULE]
            .
            [MESSAGE]
            Empty block statement.
            [MESSAGE]
            .
            [PATH]
            AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            [PATH]
            .
            [LINK]
            https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L3-L4
            [LINK]
            .
            [EXTENSION]
            js
            [EXTENSION]
            .
            [SOURCE]
              1 | var foo = bar;
              2 |
            > 3 | if (foo) {
                |          ^
            > 4 | }
                | ^^
              5 |
              6 | var p = {
              7 |     get name(){
            [SOURCE]
            .
            [ERROR]
            undefined
            [ERROR]
            .
            [REPOSITORY]
            eslint-remote-tester-integration-test-target
            [REPOSITORY]
            .
            [REPOSITORYOWNER]
            AriPerkkio
            [REPOSITORYOWNER]
            .
            [RULE]
            getter-return
            [RULE]
            .
            [MESSAGE]
            Expected to return a value in getter 'name'.
            [MESSAGE]
            .
            [PATH]
            AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            [PATH]
            .
            [LINK]
            https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L7-L7
            [LINK]
            .
            [EXTENSION]
            js
            [EXTENSION]
            .
            [SOURCE]
               5 |
               6 | var p = {
            >  7 |     get name(){
                 |     ^^^^^^^^
               8 |         // no returns.
               9 |     }
              10 | };
            [SOURCE]
            .
            [ERROR]
            undefined
            [ERROR]
            .
            [REPOSITORY]
            eslint-remote-tester-integration-test-target
            [REPOSITORY]
            .
            [REPOSITORYOWNER]
            AriPerkkio
            [REPOSITORYOWNER]
            .
            [RULE]
            no-compare-neg-zero
            [RULE]
            .
            [MESSAGE]
            Do not use the '===' operator to compare against -0.
            [MESSAGE]
            .
            [PATH]
            AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            [PATH]
            .
            [LINK]
            https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14
            [LINK]
            .
            [EXTENSION]
            js
            [EXTENSION]
            .
            [SOURCE]
              12 |
              13 |
            > 14 | if (foo === -0) {
                 |     ^^^^^^^^^^
              15 |   // prevent no-empty
              16 | }
            [SOURCE]
            .
            [ERROR]
            undefined
            [ERROR]
            [TEST-ON-COMPLETE-END]"
        `);
    });

    test('erroneous onComplete does not crash application', async () => {
        const { output, exitCode } = await runProductionBuild({
            CI: true,
            rulesUnderTesting: [],
            eslintrc: {
                root: true,
                extends: ['eslint:recommended'],
            },
            onComplete: function onComplete(results) {
                // @ts-ignore
                results.some.nonexisting.field;
            },
        });

        const errorLog = output.splice(
            output.findIndex(r => /onComplete/.test(r)),
            2
        );

        expect(errorLog.join('\n')).toMatchInlineSnapshot(`
            "Error: Error occured while calling onComplete callback
            TypeError: Cannot read property 'field' of undefined"
        `);
        expect(exitCode).toBe(0);
        expect(output.pop()).toMatch(/Results:/);
    });

    test('comparison results are written to file system on CLI mode', async () => {
        await runProductionBuild({
            compare: true,
            CI: false,
            rulesUnderTesting: [
                'no-compare-neg-zero', // Used in initial scan, not in second
                // 'no-undef', // Used in second scan, not in first
                'no-empty', // Used in both scans
            ],
            eslintrc: {
                root: true,
                extends: ['eslint:all'],
            },
        });

        const { output } = await runProductionBuild({
            compare: true,
            CI: false,
            rulesUnderTesting: [
                // 'no-compare-neg-zero', // Used in initial scan, not in second
                'no-undef', // Used in second scan, not in first
                'no-empty', // Used in both scans
            ],
            eslintrc: {
                root: true,
                extends: ['eslint:all'],
            },
        });

        expect(output.find(row => /comparison/.test(row))).toMatch(
            '[DONE] Result comparison: Added 2. Removed 1.'
        );

        // Remaining errors should be visible in results but not in comparison
        expect(getResults()).toMatch(/no-empty/);

        const comparisonResults = getComparisonResults();
        const snapshot = [
            '[ADDED]',
            comparisonResults.added,
            '[ADDED]',
            '[REMOVED]',
            comparisonResults.removed,
            '[REMOVED]',
        ].join('\n');

        expect(snapshot).toMatchInlineSnapshot(`
            "[ADDED]
            # Added:
            ## Rule: no-undef

            -   Message: \`'window' is not defined.\`
            -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js\`
            -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2-L2)

            \`\`\`js
              1 | // Identifier.name = attributeForCrashing
            > 2 | window.attributeForCrashing();
                | ^^^^^^
              3 |
            \`\`\`

            ## Rule: no-undef

            -   Message: \`'bar' is not defined.\`
            -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1)

            \`\`\`js
            > 1 | var foo = bar;
                |           ^^^
              2 |
              3 | if (foo) {
              4 | }
            \`\`\`

            [ADDED]
            [REMOVED]
            # Removed:
            ## Rule: no-compare-neg-zero

            -   Message: \`Do not use the '===' operator to compare against -0.\`
            -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
            -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14)

            \`\`\`js
              12 |
              13 |
            > 14 | if (foo === -0) {
                 |     ^^^^^^^^^^
              15 |   // prevent no-empty
              16 | }
            \`\`\`

            [REMOVED]"
        `);
    });

    test('comparison result reference updating can be disabled', async () => {
        await runProductionBuild({
            compare: true,
            CI: false,
            rulesUnderTesting: [
                'no-compare-neg-zero', // Used in initial scan, not in second
                // 'no-undef', // Used in second scan, not in first
                'no-empty', // Used in both scans
            ],
            eslintrc: {
                root: true,
                extends: ['eslint:all'],
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _ of [1, 2]) {
            const { output } = await runProductionBuild({
                updateComparisonReference: false,
                compare: true,
                CI: false,
                rulesUnderTesting: [
                    // 'no-compare-neg-zero', // Used in initial scan, not in second
                    'no-undef', // Used in second scan, not in first
                    'no-empty', // Used in both scans
                ],
                eslintrc: {
                    root: true,
                    extends: ['eslint:all'],
                },
            });

            // Comparison results should not change between runs
            expect(output.find(row => /comparison/.test(row))).toMatch(
                '[DONE] Result comparison: Added 2. Removed 1.'
            );
        }
    });

    test('comparison results are rendered on CI mode', async () => {
        await runProductionBuild({
            compare: true,
            CI: true,
            rulesUnderTesting: [
                'no-compare-neg-zero', // Used in initial scan, not in second
                // 'no-undef', // Used in second scan, not in first
                'no-empty', // Used in both scans
            ],
            eslintrc: {
                root: true,
                extends: ['eslint:all'],
            },
        });

        const { output } = await runProductionBuild({
            compare: true,
            CI: true,
            rulesUnderTesting: [
                // 'no-compare-neg-zero', // Used in initial scan, not in second
                'no-undef', // Used in second scan, not in first
                'no-empty', // Used in both scans
            ],
            eslintrc: {
                root: true,
                extends: ['eslint:all'],
            },
        });

        // Remaining errors should be visible in results but not in comparison
        const [results, comparisonResults] = output.reverse();
        expect(results).toMatch(/no-empty/);

        expect(comparisonResults).toMatchInlineSnapshot(`
            "Comparison results:
            Added:
            Rule: no-undef
            Message: 'window' is not defined.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2-L2

              1 | // Identifier.name = attributeForCrashing
            > 2 | window.attributeForCrashing();
                | ^^^^^^
              3 |

            Rule: no-undef
            Message: 'bar' is not defined.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1

            > 1 | var foo = bar;
                |           ^^^
              2 |
              3 | if (foo) {
              4 | }


            Removed:
            Rule: no-compare-neg-zero
            Message: Do not use the '===' operator to compare against -0.
            Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14

              12 |
              13 |
            > 14 | if (foo === -0) {
                 |     ^^^^^^^^^^
              15 |   // prevent no-empty
              16 | }


            "
        `);
    });

    test('calls onComplete hook with the comparison results', async () => {
        await runProductionBuild({
            compare: true,
            CI: true,
            rulesUnderTesting: [
                'no-compare-neg-zero', // Used in initial scan, not in second
                // 'no-undef', // Used in second scan, not in first
                'no-empty', // Used in both scans
            ],
            eslintrc: {
                root: true,
                extends: ['eslint:all'],
            },
        });

        const { output } = await runProductionBuild({
            compare: true,
            CI: true,
            rulesUnderTesting: [
                // 'no-compare-neg-zero', // Used in initial scan, not in second
                'no-undef', // Used in second scan, not in first
                'no-empty', // Used in both scans
            ],
            eslintrc: {
                root: true,
                extends: ['eslint:all'],
            },
            onComplete: function onComplete(_, comparisonResults) {
                console.log('[TEST-ON-COMPLETE-START]');

                for (const type of ['added', 'removed']) {
                    console.log(`[${type.toUpperCase()}]`);
                    // @ts-ignore
                    comparisonResults[type].forEach(result => {
                        Object.entries(result).forEach(([key, value]) => {
                            if (key === '__internalHash') return;
                            const block = `[${key.toUpperCase()}]`;

                            console.log('.');
                            console.log(block);
                            console.log(value);
                            console.log(block);
                        });
                    });
                    console.log(`[${type.toUpperCase()}]`);
                }

                console.log('[TEST-ON-COMPLETE-END]');
            },
        });

        const [onCompleteCall] = output
            .join('\n')
            .match(
                /\[TEST-ON-COMPLETE-START\]([\s|\S]*)\[TEST-ON-COMPLETE-END\]/
            )!;

        expect(onCompleteCall).toMatchInlineSnapshot(`
            "[TEST-ON-COMPLETE-START]
            [ADDED]
            .
            [REPOSITORY]
            eslint-remote-tester-integration-test-target
            [REPOSITORY]
            .
            [REPOSITORYOWNER]
            AriPerkkio
            [REPOSITORYOWNER]
            .
            [RULE]
            no-undef
            [RULE]
            .
            [MESSAGE]
            'window' is not defined.
            [MESSAGE]
            .
            [PATH]
            AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
            [PATH]
            .
            [LINK]
            https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2-L2
            [LINK]
            .
            [EXTENSION]
            js
            [EXTENSION]
            .
            [SOURCE]
              1 | // Identifier.name = attributeForCrashing
            > 2 | window.attributeForCrashing();
                | ^^^^^^
              3 |
            [SOURCE]
            .
            [ERROR]
            undefined
            [ERROR]
            .
            [REPOSITORY]
            eslint-remote-tester-integration-test-target
            [REPOSITORY]
            .
            [REPOSITORYOWNER]
            AriPerkkio
            [REPOSITORYOWNER]
            .
            [RULE]
            no-undef
            [RULE]
            .
            [MESSAGE]
            'bar' is not defined.
            [MESSAGE]
            .
            [PATH]
            AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            [PATH]
            .
            [LINK]
            https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1
            [LINK]
            .
            [EXTENSION]
            js
            [EXTENSION]
            .
            [SOURCE]
            > 1 | var foo = bar;
                |           ^^^
              2 |
              3 | if (foo) {
              4 | }
            [SOURCE]
            .
            [ERROR]
            undefined
            [ERROR]
            [ADDED]
            [REMOVED]
            .
            [REPOSITORY]
            eslint-remote-tester-integration-test-target
            [REPOSITORY]
            .
            [REPOSITORYOWNER]
            AriPerkkio
            [REPOSITORYOWNER]
            .
            [RULE]
            no-compare-neg-zero
            [RULE]
            .
            [MESSAGE]
            Do not use the '===' operator to compare against -0.
            [MESSAGE]
            .
            [PATH]
            AriPerkkio/eslint-remote-tester-integration-test-target/index.js
            [PATH]
            .
            [LINK]
            https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14
            [LINK]
            .
            [EXTENSION]
            js
            [EXTENSION]
            .
            [SOURCE]
              12 |
              13 |
            > 14 | if (foo === -0) {
                 |     ^^^^^^^^^^
              15 |   // prevent no-empty
              16 | }
            [SOURCE]
            [REMOVED]
            [TEST-ON-COMPLETE-END]"
        `);
    });
});
