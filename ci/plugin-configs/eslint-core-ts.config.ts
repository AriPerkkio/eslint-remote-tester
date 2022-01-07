import type { Config } from 'eslint-remote-tester';
import baseConfig from '../base.config';

const config: Config = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extends: ['eslint:all'],

        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/all.ts
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/eslint-recommended.ts
        rules: {
            'brace-style': 'off',
            'comma-dangle': 'off',
            'comma-spacing': 'off',
            'constructor-super': 'off',
            'default-param-last': 'off',
            'dot-notation': 'off',
            'func-call-spacing': 'off',
            'getter-return': 'off',
            'init-declarations': 'off',
            'keyword-spacing': 'off',
            'lines-between-class-members': 'off',
            'no-array-constructor': 'off',
            'no-const-assign': 'off',
            'no-dupe-args': 'off',
            'no-dupe-class-members': 'off',
            'no-dupe-keys': 'off',
            'no-duplicate-imports': 'off',
            'no-empty-function': 'off',
            'no-extra-parens': 'off',
            'no-extra-semi': 'off',
            'no-func-assign': 'off',
            'no-implied-eval': 'off',
            'no-import-assign': 'off',
            'no-invalid-this': 'off',
            'no-loop-func': 'off',
            'no-loss-of-precision': 'off',
            'no-magic-numbers': 'off',
            'no-new-symbol': 'off',
            'no-obj-calls': 'off',
            'no-redeclare': 'off',
            'no-return-await': 'off',
            'no-setter-return': 'off',
            'no-shadow': 'off',
            'no-this-before-super': 'off',
            'no-throw-literal': 'off',
            'no-undef': 'off',
            'no-unreachable': 'off',
            'no-unsafe-negation': 'off',
            'no-unused-expressions': 'off',
            'no-unused-vars': 'off',
            'no-use-before-define': 'off',
            'no-useless-constructor': 'off',
            'no-var': 'error',
            'prefer-const': 'error',
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            'require-await': 'off',
            'space-before-function-paren': 'off',
            'space-infix-ops': 'off',
            'valid-typeof': 'off',
            indent: 'off',
            quotes: 'off',
            semi: 'off',

            // https://github.com/AriPerkkio/eslint-remote-tester/issues/315
            'no-restricted-exports': 'off',
        },
    },
};

export default config;
