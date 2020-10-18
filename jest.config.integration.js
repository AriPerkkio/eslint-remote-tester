const sharedConfig = require('./jest.config');

module.exports = {
    ...sharedConfig,
    roots: ['test/integration'],
    testPathIgnorePatterns: [/* Reset ignores set by shared config */],
    setupFilesAfterEnv: [
        ...sharedConfig.setupFilesAfterEnv,
        './test/integration/jest.setup.integration.ts'
    ],
};
