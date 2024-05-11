import { Linter } from 'eslint';
import type { Config } from 'eslint-remote-tester';

import baseConfig from '../base.config';

const baseEslintrc = baseConfig.eslintrc as Linter.Config;

const config: Config = {
    ...baseConfig,
    concurrentTasks: 1,
    eslintrc: function initializeLinter() {
        return {
            ...baseEslintrc,
            plugins: ['@typescript-eslint'],
            extends: [
                'plugin:@typescript-eslint/all',
                'plugin:@typescript-eslint/disable-type-checked',
            ],
        };
    },
};

export default config;
