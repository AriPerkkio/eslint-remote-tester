const sharedConfig = require('./jest.config');

module.exports = {
    ...sharedConfig,
    roots: ['test/integration'],
    setupFilesAfterEnv: ['./test/integration/jest.setup.integration.ts'],
    watchPathIgnorePatterns: [
        './test/integration/integration.config-[0-9]*.js',
    ],
};
