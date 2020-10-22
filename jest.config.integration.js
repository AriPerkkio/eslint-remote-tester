const sharedConfig = require('./jest.config');

module.exports = {
  ...sharedConfig,
  roots: ['test/integration'],
  testPathIgnorePatterns: [/* Reset ignores set by shared config */],
  setupFiles: ['./test/integration/jest.env.setup.integration.ts'],
  setupFilesAfterEnv: [
    ...sharedConfig.setupFilesAfterEnv,
    './test/integration/jest.setup.integration.ts',
  ],
};
