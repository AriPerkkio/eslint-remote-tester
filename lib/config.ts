import fs from 'fs';
import path from 'path';
import { Linter } from 'eslint';

/** Contents of the `eslint-remote-tester.config.js` */
interface Config {
    repositories: string[];
    extensions: string[];
    pathIgnorePattern?: string;
    rulesUnderTesting: string[];
    concurrentTasks?: number;
    eslintrc: Linter.Config;
}

const CONFIGURATION_FILE = 'eslint-remote-tester.config.js';
const CONFIGURATION_FILE_TEMPLATE = `module.exports = {
    /** Repositories to scan */
    repositories: ['reactjs/reactjs.org'],

    /** Extensions of files under scanning */
    extensions: ['.js'],

    /** Optional pattern used to exclude paths */
    pathIgnorePattern: "(node_modules|^\\\\.|test-results)",

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
const {
    repositories,
    extensions,
    pathIgnorePattern,
    rulesUnderTesting,
    concurrentTasks,
    eslintrc,
} = config;
const errors: string[] = [];

// Required fields
if (!repositories || !repositories.length) {
    errors.push(`Missing repositories.`);
}
if (!extensions || !extensions.length) {
    errors.push(`Missing extensions.`);
}
if (!rulesUnderTesting) {
    errors.push(`Missing rulesUnderTesting.`);
} else if (!Array.isArray(rulesUnderTesting)) {
    errors.push(`Config rulesUnderTesting should be an array.`);
}
if (!eslintrc) {
    errors.push(`Missing eslintrc.`);
}

// Optional fields
if (pathIgnorePattern) {
    try {
        new RegExp(pathIgnorePattern);
    } catch (e) {
        errors.push(
            `pathIgnorePattern (${pathIgnorePattern}) is not valid regex: ${e.message}`
        );
    }
}
if (concurrentTasks && typeof concurrentTasks !== 'number') {
    errors.push(`concurrentTasks (${concurrentTasks}) should be a number.`);
}

if (errors.length) {
    const configurationValidationErrors = `Configuration validation errors at ${CONFIGURATION_FILE}: ${errors.join(
        '\n'
    )}\n`;

    throw new Error(configurationValidationErrors);
}

export default config;
