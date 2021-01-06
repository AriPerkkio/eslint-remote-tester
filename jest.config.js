module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    roots: ['test/unit'],
    setupFilesAfterEnv: ['./test/unit/jest.setup.unit.ts'],
    moduleNameMapper: {
        '^@config(.*)$': '<rootDir>/lib/config$1',
        '^@engine(.*)$': '<rootDir>/lib/engine$1',
        '^@file-client(.*)$': '<rootDir>/lib/file-client$1',
        '^@progress-logger(.*)$': '<rootDir>/lib/progress-logger$1',
        '^@ui(.*)$': '<rootDir>/lib/ui$1',
        '^__mocks__/(.*)$': '<rootDir>/test/unit/__mocks__/$1',
    },
};
