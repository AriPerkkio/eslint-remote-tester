import fs from 'node:fs';
import { expect, test, vi } from 'vitest';

import * as actionExports from '../../dist/exports-for-compare-action.js';

test('exports RESULT_PARSER_TO_COMPARE_TEMPLATE', () => {
    expect(actionExports.RESULT_PARSER_TO_COMPARE_TEMPLATE)
        .toMatchInlineSnapshot(`
        {
          "markdown": {
            "header": [Function],
            "results": [Function],
          },
          "plaintext": {
            "header": [Function],
            "results": [Function],
          },
        }
    `);
});

test('exports RESULT_COMPARISON_CACHE', () => {
    expect(actionExports.RESULT_COMPARISON_CACHE).toMatchInlineSnapshot(
        `".comparison-cache.json"`
    );
});

test('exports RESULTS_COMPARISON_CACHE_LOCATION', () => {
    expect(
        actionExports.RESULTS_COMPARISON_CACHE_LOCATION
    ).toMatchInlineSnapshot(
        `"./node_modules/.cache-eslint-remote-tester/.comparison-cache.json"`
    );
});

test('exports validateConfig', async () => {
    const consolelog = console.log;
    console.log = vi.fn();

    expect(() => actionExports.validateConfig({}, false)).rejects
        .toThrowErrorMatchingInlineSnapshot(`
      [Error: Configuration validation errors:
      - Missing repositories.
      - Missing extensions.
      - Missing eslintConfig.]
    `);

    console.log = consolelog;
});

test('exports loadConfig', async () => {
    expect(actionExports.loadConfig).toBeInstanceOf(Function);
});

test('exports typings', () => {
    expect(fs.readFileSync('dist/exports-for-compare-action.d.ts', 'utf8'))
        .toMatchInlineSnapshot(`
"/**
 * Undocumented private API for Github CI actions:
 * - \`eslint-remote-tester-compare-action\`
 * - \`eslint-remote-tester-run-action\`
 */
export { RESULT_PARSER_TO_COMPARE_TEMPLATE, Result, ComparisonResults, } from './file-client/result-templates.js';
export { RESULT_COMPARISON_CACHE, RESULTS_COMPARISON_CACHE_LOCATION, } from './file-client/file-constants.js';
export { default as validateConfig } from './config/validator.js';
export { loadConfig } from './config/load.js';
export { Config, ConfigToValidate } from './config/types.js';
//# sourceMappingURL=exports-for-compare-action.d.ts.map"
`);
});
