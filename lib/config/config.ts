import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { workerData, isMainThread } from 'worker_threads';

import { getConfigWithDefaults } from './validator';
import { CONFIGURATION_FILE_TEMPLATE } from './config-templates';
import { WorkerData } from '@engine/types';
import { Service } from 'ts-node';

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

let registerer: Service | null = null;

/* istanbul ignore next */
const interopRequireDefault = (obj: any): { default: any } =>
    obj && obj.__esModule ? obj : { default: obj };

const loadTSConfig = (configPath: string) => {
    try {
        registerer ||= require('ts-node').register() as Service;
    } catch (e: any) {
        if (e.code === 'MODULE_NOT_FOUND') {
            throw new Error(
                `'ts-node' is required for TypeScript configuration files. Make sure it is installed\nError: ${e.message}`
            );
        }

        throw e;
    }

    registerer.enabled(true);

    const configObject = interopRequireDefault(require(configPath)).default;

    registerer.enabled(false);

    return configObject;
};

const loadConfig = (configPath: string) => {
    if (configPath.endsWith('.ts')) {
        return loadTSConfig(configPath);
    }

    return require(configPath);
};

const configFileContents = loadConfig(path.resolve(CONFIGURATION_FILE));
const config = getConfigWithDefaults(configFileContents);

export default config;
