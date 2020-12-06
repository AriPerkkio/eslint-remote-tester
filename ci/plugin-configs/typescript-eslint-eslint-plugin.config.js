const baseConfig = require('../base.config');

module.exports = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        plugin: ['@typescript-eslint'],
        extends: ['plugin:@typescript-eslint/all'],
        rules: {
            // Disable all rules which require type information since adding
            // project specific parserOptions.project is not supported
            '@typescript-eslint/await-thenable': 'off',
            '@typescript-eslint/naming-convention': 'off',
            '@typescript-eslint/no-base-to-string': 'off',
            '@typescript-eslint/no-confusing-void-expression': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-for-in-array': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/no-unnecessary-qualifier': 'off',
            '@typescript-eslint/no-unnecessary-type-arguments': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/prefer-includes': 'off',
            '@typescript-eslint/prefer-nullish-coalescing': 'off',
            '@typescript-eslint/prefer-readonly': 'off',
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            '@typescript-eslint/prefer-reduce-type-parameter': 'off',
            '@typescript-eslint/prefer-regexp-exec': 'off',
            '@typescript-eslint/prefer-string-starts-ends-with': 'off',
            '@typescript-eslint/promise-function-async': 'off',
            '@typescript-eslint/require-array-sort-compare': 'off',
            '@typescript-eslint/restrict-plus-operands': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/strict-boolean-expressions': 'off',
            '@typescript-eslint/switch-exhaustiveness-check': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/dot-notation': 'off',
            '@typescript-eslint/no-implied-eval': 'off',
            '@typescript-eslint/no-throw-literal': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/return-await': 'off',
        },
    },
};
