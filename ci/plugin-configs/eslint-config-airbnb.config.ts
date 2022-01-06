import type { Config } from 'eslint-remote-tester';
import baseConfig from '../base.config';

const config: Config = {
    ...baseConfig,
    extensions: ['js', 'jsx'],
    eslintrc: {
        ...baseConfig.eslintrc,
        parser: undefined,
        extends: ['airbnb', 'airbnb/hooks', 'airbnb/whitespace'],
    },
};

export default config;
