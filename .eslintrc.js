module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['node', '@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:node/recommended',
        'prettier/@typescript-eslint',
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'node/no-missing-import': ['off'], // Path alias not supported
        'node/shebang': [
            'error',
            {
                convertPath: {
                    'lib/*.ts': ['^lib/(.+?)\\.ts$', 'dist/$1.js'],
                },
            },
        ],
        'no-process-exit': 'off',
        'prettier/prettier': 'error',
        'node/no-unsupported-features/es-syntax': 'off',
    },
    overrides: [
        {
            files: ['*config*', 'test/**/*.ts'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
        {
            files: ['*.test.ts'],
            rules: {
                '@typescript-eslint/no-non-null-assertion': 'off',
            },
        },
    ],
};
