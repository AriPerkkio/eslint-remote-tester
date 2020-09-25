import fs from 'fs';
import path from 'path';

import validateConfiguration from './validator';
import { CONFIGURATION_FILE_TEMPLATE } from './config-templates';
import { Config } from './types';

const CONFIGURATION_FILE = 'eslint-remote-tester.config.js';

if (!fs.existsSync(CONFIGURATION_FILE)) {
    fs.writeFileSync(CONFIGURATION_FILE, CONFIGURATION_FILE_TEMPLATE, 'utf8');

    throw new Error( // Configuration file was not found
        `Missing configuratin file ${CONFIGURATION_FILE}.` +
            '\nDefault configuration file created.'
    );
}

const config: Config = require(path.resolve(CONFIGURATION_FILE));

validateConfiguration(config);
export default config;
