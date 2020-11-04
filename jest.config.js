module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['test'],
    testPathIgnorePatterns: ['test/integration'],
    verbose: true,
    setupFilesAfterEnv: ['./test/jest.setup.ts'],
    moduleNameMapper: {
        '^@config(.*)$': '<rootDir>/lib/config$1',
        '^@engine(.*)$': '<rootDir>/lib/engine$1',
        '^@file-client(.*)$': '<rootDir>/lib/file-client$1',
        '^@progress-logger(.*)$': '<rootDir>/lib/progress-logger$1',
        '^@ui(.*)$': '<rootDir>/lib/ui$1',
    },
};
