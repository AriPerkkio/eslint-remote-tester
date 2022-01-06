import type { Config } from 'eslint-remote-tester';
import {
    getRepositories,
    getPathIgnorePattern,
} from 'eslint-remote-tester-repositories';

const config: Config = {
    repositories: process.env.PLUGIN_TEST
        ? [getRepositories()[0]]
        : getRepositories({ randomize: true }),
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    pathIgnorePattern: getPathIgnorePattern(),
    resultParser: 'markdown',
    concurrentTasks: 3,
    logLevel: process.env.CI ? 'info' : 'verbose',
    cache: process.env.CI ? false : true,
    timeLimit: 5.9 * 60 * 60,
    CI: true,
    eslintrc: {
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
                version: '16.13.1',
            },
            jest: {
                version: 26,
            },
        },
    },
};

export default config;
