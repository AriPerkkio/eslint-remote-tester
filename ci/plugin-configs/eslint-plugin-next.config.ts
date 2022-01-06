import type { Config } from 'eslint-remote-tester';
import baseConfig from '../base.config';

const config: Config = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extends: ['plugin:@next/next/recommended'],

        // TODO: Search for src/pages and enable this rule if found
        rules: {
            '@next/next/no-html-link-for-pages': 'off',
        },
    },
};

export default config;
