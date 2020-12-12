const baseConfig = require('../base.config');

module.exports = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        plugins: ['testing-library'],
        rules: {
            'testing-library/await-async-query': 'error',
            'testing-library/await-async-utils': 'error',
            'testing-library/await-fire-event': 'error',
            'testing-library/consistent-data-testid': [
                'error',
                {
                    testIdPattern: '^TestId(__[A-Z]*)?$',
                    testIdAttribute: ['data-testid', 'testId'],
                },
            ],
            'testing-library/no-await-sync-events': 'error',
            'testing-library/no-await-sync-query': 'error',
            'testing-library/no-debug': [
                'error',
                {
                    renderFunctions: [
                        'render',
                        'renderWithRedux',
                        'renderWithRouter',
                    ],
                },
            ],
            'testing-library/no-dom-import': ['error', 'react'],
            'testing-library/no-manual-cleanup': 'error',
            'testing-library/no-render-in-setup': [
                'error',
                {
                    renderFunctions: [
                        'render',
                        'renderWithRedux',
                        'renderWithRouter',
                    ],
                    allowTestingFrameworkSetupHook: 'beforeAll',
                },
            ],

            'testing-library/no-wait-for-empty-callback': 'error',
            'testing-library/no-wait-for-snapshot': 'error',
            'testing-library/prefer-explicit-assert': 'error',
            'testing-library/prefer-find-by': 'error',
            'testing-library/prefer-presence-queries': 'error',
            'testing-library/prefer-screen-queries': 'error',
            'testing-library/prefer-wait-for': 'error',
        },
    },
};
