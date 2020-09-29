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
        'plugin:node/recommended-module',
        'prettier/@typescript-eslint',
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'node/no-missing-import': [
            'error',
            {
                tryExtensions: ['.ts', '.d.ts'],
                resolvePaths: [__dirname + '/lib'],
            },
        ],
        'node/shebang': [
            'error',
            {
                convertPath: {
                    'lib/*.ts': ['^lib/(.+?)\\.ts$', 'dist/$1.js']
                },
            },
        ],
        'prettier/prettier': 'error',
    },
    overrides: [
        {
            files: ['config.ts'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
};
