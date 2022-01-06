import type { Config } from 'eslint-remote-tester';
import baseConfig from '../base.config';

const config: Config = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extends: [
            'plugin:import/errors',
            'plugin:import/warnings',
            'plugin:import/typescript',
        ],
    },
};

export default config;
