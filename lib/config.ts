import fs from 'fs';
import path from 'path';
import { Linter } from 'eslint';

/** Contents of the `eslint-remote-tester.config.js` */
interface Config {
    repositories: string[];
    extensions: string[];
    rulesUnderTesting: string[];
    concurrentTasks: number;
    eslintrc: Linter.Config;
}

const CONFIGURATION_FILE = 'eslint-remote-tester.config.js';
const CONFIGURATION_FILE_TEMPLATE = `module.exports = {
    /** Repositories to scan */
    repositories: ['reactjs/reactjs.org'],

    /** Extensions of files under scanning */
    extensions: ['.js'],

    /** Rules used to filter out results */
    rulesUnderTesting: ['react/no-direct-mutation-state'],

    /** Maximum amount of tasks ran concurrently */
    concurrentTasks: 5,

    /** ESLint configuration */
    eslintrc: {
        root: true,
        env: {
            es6: true,
        },
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
        },
        plugins: ['react'],
        rules: {
            'react/no-direct-mutation-state': ['error'],
        },
    }
}`;

if (!fs.existsSync(CONFIGURATION_FILE)) {
    fs.writeFileSync(CONFIGURATION_FILE, CONFIGURATION_FILE_TEMPLATE, 'utf8');

    throw new Error( // Configuration file was not found
        `Missing configuratin file ${CONFIGURATION_FILE}.` +
            '\nDefault configuration file created.'
    );
}

const config: Config = require(path.resolve(CONFIGURATION_FILE));
const errors: string[] = [];

// Required fields
if (!config.repositories || !config.repositories.length) {
    errors.push(`Missing repositories.`);
}
if (!config.extensions || !config.extensions.length) {
    errors.push(`Missing extensions.`);
}
if (!config.rulesUnderTesting || !config.rulesUnderTesting.length) {
    errors.push(`Missing rulesUnderTesting.`);
}
if (!config.eslintrc) {
    errors.push(`Missing eslintrc.`);
}

// Optional fields
if (config.concurrentTasks && typeof config.concurrentTasks !== 'number') {
    errors.push(
        `concurrentTasks (${config.concurrentTasks}) should be a number in ${CONFIGURATION_FILE}.`
    );
}

if (errors.length) {
    throw new Error(
        `Configuration validation errors at ${CONFIGURATION_FILE}: ${errors.join(
            '\n'
        )}`
    );
}

export default config;
