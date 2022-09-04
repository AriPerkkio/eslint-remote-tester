import type { Config } from 'eslint-remote-tester';
import baseConfig from '../base.config';

const config: Config = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extends: ['plugin:jest/all'],
        rules: {
            'jest/unbound-method': 'off',
        },
    },
};

export default config;
