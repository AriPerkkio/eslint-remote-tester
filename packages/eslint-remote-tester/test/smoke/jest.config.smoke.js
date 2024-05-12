const sharedConfig = require('../jest.config.base');

module.exports = {
    ...sharedConfig,
    roots: ['test/smoke'],
    setupFilesAfterEnv: ['<rootDir>/test/smoke/jest.setup.smoke.ts'],
};
