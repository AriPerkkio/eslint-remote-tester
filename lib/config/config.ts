import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { workerData, isMainThread } from 'worker_threads';

import constructAndValidateConfiguration from './validator';
import { CONFIGURATION_FILE_TEMPLATE } from './config-templates';
import { Config } from './types';
import { WorkerData } from '../engine/types';

const DEFAULT_CONFIGURATION_FILE = 'eslint-remote-tester.config.js';
const CLI_ARGS_CONFIG = ['-c', '--config'];

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
        DEFAULT_CONFIGURATION_FILE
    );
}

const CONFIGURATION_FILE = resolveConfigurationLocation();

if (!fs.existsSync(CONFIGURATION_FILE)) {
    let defaultCreated = false;

    if (CONFIGURATION_FILE === DEFAULT_CONFIGURATION_FILE) {
        fs.writeFileSync(
            CONFIGURATION_FILE,
            CONFIGURATION_FILE_TEMPLATE,
            'utf8'
        );
        defaultCreated = true;
    }

    console.log(chalk.red(`Missing configuratin file ${CONFIGURATION_FILE}.`));
    if (defaultCreated) {
        console.log(
            chalk.green(
                `Default configuration file created: ${DEFAULT_CONFIGURATION_FILE}`
            )
        );
    }
    process.exit();
}

const config: Config = require(path.resolve(CONFIGURATION_FILE));

export default constructAndValidateConfiguration(config);
