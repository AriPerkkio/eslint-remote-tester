import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
    js.configs.recommended,
    ...tseslint.configs.recommended,
    { ignores: ['**/dist', '.cache-eslint-remote-tester', 'docs'] },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        files: ['*config*', 'ci/**', '**/test/**/*.ts*', '**/*.js', '**/*.cjs'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
        },
        languageOptions: {
            globals: {
                require: 'readonly',
                module: 'readonly',
                process: 'readonly',
            },
        },
    },
    eslintPluginPrettierRecommended,
]);

/** @param config {import('eslint').Linter.FlatConfig} */
function defineConfig(config) {
    return config;
}
