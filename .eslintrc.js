module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    plugins: ['node', 'react', 'react-hooks', '@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
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
        'node/no-missing-require': [
            'error',
            {
                tryExtensions: ['.js', '.ts', '.tsx'],
            },
        ],
    },
    overrides: [
        {
            files: ['*.tsx'],
            rules: {
                'react/prop-types': ['off'], // Covered by React.FC
            },
        },
        {
            files: ['ci/*'],
            rules: {
                'node/no-unpublished-require': 'off',
            },
        },
        {
            files: ['*config*', 'test/**/*.ts*', '*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
        {
            files: ['*.test.ts*'],
            rules: {
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/ban-ts-comment': 'off',
            },
        },
    ],
};
