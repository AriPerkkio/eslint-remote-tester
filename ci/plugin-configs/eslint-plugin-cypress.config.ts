import type { Config } from 'eslint-remote-tester';
import baseConfig from '../base.config';

const config: Config = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        plugins: ['cypress'],
        extends: ['plugin:cypress/recommended'],
        rules: {
            'cypress/no-force': 'error',
            'cypress/assertion-before-screenshot': 'error',
            'cypress/require-data-selectors': 'error',
        },
    },
};

export default config;
