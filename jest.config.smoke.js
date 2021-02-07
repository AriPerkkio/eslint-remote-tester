const sharedConfig = require('./jest.config');

module.exports = {
    ...sharedConfig,
    roots: ['test/smoke'],
    setupFilesAfterEnv: ['./test/smoke/jest.setup.smoke.ts'],
};
