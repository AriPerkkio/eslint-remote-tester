import type { Config } from 'eslint-remote-tester';
import baseConfig from '../base.config';

const config: Config = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extends: ['plugin:react-redux/recommended'],
    },
};

export default config;
