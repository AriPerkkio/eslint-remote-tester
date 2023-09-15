import type { Config } from 'eslint-remote-tester';
import baseConfig from '../base.config';

const config: Config = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        plugins: ['testing-library'],
        rules: {
            'testing-library/await-async-utils': 'error',
            'testing-library/consistent-data-testid': [
                'error',
                { testIdPattern: '^TestId(__[A-Z]*)?$' },
            ],
            'testing-library/no-await-sync-events': 'error',
            'testing-library/no-container': 'error',
            'testing-library/no-debugging-utils': 'error',
            'testing-library/no-dom-import': ['error', 'react'],
            'testing-library/no-manual-cleanup': 'error',
            'testing-library/no-node-access': 'error',
            'testing-library/no-promise-in-fire-event': 'error',
            'testing-library/no-wait-for-multiple-assertions': 'error',
            'testing-library/no-wait-for-side-effects': 'error',
            'testing-library/no-wait-for-snapshot': 'error',
            'testing-library/prefer-explicit-assert': 'error',
            'testing-library/prefer-find-by': 'error',
            'testing-library/prefer-presence-queries': 'error',
            'testing-library/prefer-screen-queries': 'error',
            'testing-library/prefer-user-event': 'error',
            'testing-library/render-result-naming-convention': 'error',
        },
    },
};

export default config;
