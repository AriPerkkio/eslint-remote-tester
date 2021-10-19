import fs from 'fs';

import * as actionExports from '../../dist/exports-for-compare-action';

test('exports RESULT_PARSER_TO_COMPARE_TEMPLATE', () => {
    expect(actionExports.RESULT_PARSER_TO_COMPARE_TEMPLATE)
        .toMatchInlineSnapshot(`
        Object {
          "markdown": Object {
            "header": [Function],
            "results": [Function],
          },
          "plaintext": Object {
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
    console.log = jest.fn();

    expect(() => actionExports.validateConfig({}, false)).rejects
        .toThrowErrorMatchingInlineSnapshot(`
        "Configuration validation errors:
        - Missing repositories.
        - Missing extensions.
        - Missing eslintrc."
    `);

    console.log = consolelog;
});

test('exports typings', () => {
    expect(fs.readFileSync('dist/exports-for-compare-action.d.ts', 'utf8'))
        .toMatchInlineSnapshot(`
        "/**
         * Undocumented private API for Github CI action eslint-remote-tester-compare-action
         */
        export { RESULT_PARSER_TO_COMPARE_TEMPLATE, Result, ComparisonResults, } from './file-client/result-templates';
        export { RESULT_COMPARISON_CACHE, RESULTS_COMPARISON_CACHE_LOCATION, } from './file-client/file-constants';
        export { default as validateConfig } from './config/validator';
        export { Config, ConfigToValidate } from './config/types';
        //# sourceMappingURL=exports-for-compare-action.d.ts.map"
    `);
});
