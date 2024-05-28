import fs from 'node:fs';
import path from 'node:path';
import { workerData, isMainThread } from 'node:worker_threads';
import chalk from 'chalk';

import { getConfigWithDefaults } from './validator.js';
import { loadConfig } from './load.js';
import { WorkerData } from '../engine/types.js';

const DEFAULT_CONFIGURATION_FILE_NAME = 'eslint-remote-tester.config';
const DEFAULT_CONFIGURATION_FILE_JS = `${DEFAULT_CONFIGURATION_FILE_NAME}.js`;
const DEFAULT_CONFIGURATION_FILE_TS = `${DEFAULT_CONFIGURATION_FILE_NAME}.ts`;
const CLI_ARGS_CONFIG = ['-c', '--config'];

function determineDefaultConfigFile() {
    if (fs.existsSync(DEFAULT_CONFIGURATION_FILE_TS)) {
        return DEFAULT_CONFIGURATION_FILE_TS;
    }

    return DEFAULT_CONFIGURATION_FILE_JS;
}

export function resolveConfigurationLocation(): string {
    // Main thread can read config location from args
    const configArgumentIndex = process.argv.findIndex(arg =>
        CLI_ARGS_CONFIG.includes(arg)
    );
    const cliConfigLocation =
        configArgumentIndex !== -1 && process.argv[configArgumentIndex + 1];

    // Worker threads can read config location from workerData
    const workerDataConfiguration =
        !isMainThread &&
        workerData &&
        (workerData as WorkerData).configurationLocation;

    return (
        cliConfigLocation ||
        workerDataConfiguration ||
        determineDefaultConfigFile()
    );
}

const CONFIGURATION_FILE = resolveConfigurationLocation();

if (!fs.existsSync(CONFIGURATION_FILE)) {
    console.log(chalk.red(`Missing configuration file ${CONFIGURATION_FILE}.`));
    process.exit();
}

const configFileContents = await loadConfig(path.resolve(CONFIGURATION_FILE));
const config = getConfigWithDefaults(configFileContents);

export default config;
