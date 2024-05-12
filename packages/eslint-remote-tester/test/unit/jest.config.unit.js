const sharedConfig = require('../jest.config.base');

module.exports = {
    ...sharedConfig,
    roots: ['./test/unit'],
    setupFilesAfterEnv: ['<rootDir>/test/unit/jest.setup.unit.ts'],
    moduleNameMapper: {
        ...sharedConfig.moduleNameMapper,
        '^__mocks__/(.*)$': '<rootDir>/test/unit/__mocks__/$1',
    },
};
