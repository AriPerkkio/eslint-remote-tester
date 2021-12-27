const sharedConfig = require('../jest.config.base');

module.exports = {
    ...sharedConfig,
    roots: ['test/integration'],
    setupFilesAfterEnv: [
        '<rootDir>/test/integration/jest.setup.integration.ts',
    ],
    watchPathIgnorePatterns: [
        '<rootDir>/test/integration/integration.config-[0-9]*.[jt]s',
    ],
};
