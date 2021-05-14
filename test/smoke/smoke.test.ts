import { runProductionBuild } from '../utils';

const BASE_CONFIG = './smoke/base.config.js';

describe('smoke', () => {
    test('does not crash when handling 500Mb results', async () => {
        await runProductionBuild({ CI: false, compare: true }, BASE_CONFIG);

        const { output } = await runProductionBuild(
            {
                CI: false,
                compare: true,
                eslintrc: {
                    root: true,
                    plugins: ['local-rules'],
                    rules: {
                        'local-rules/verbose-rule-2': 'error',
                    },
                },
            },
            BASE_CONFIG
        );

        expect(output.pop()).toMatchInlineSnapshot(`
            "Full log:
            [INFO] Cached repositories (1) at ./node_modules/.cache-eslint-remote-tester
            [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target 56000 errors
            [DONE] Finished scan of 1 repositories
            [INFO] Cached repositories (1) at ./node_modules/.cache-eslint-remote-tester
            [DONE] Result comparison: Added 56000. Removed 56000.

            "
        `);
    });
});
