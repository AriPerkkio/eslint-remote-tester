// Remove possible "--config" flags so that "jest --config" doesn't conflict
// with "eslint-remote-tester --config"
process.argv.splice(0);

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    rootDir: process.cwd(),
    prettierPath: null,
    moduleNameMapper: {
        '^@config(.*)$': '<rootDir>/src/config$1',
        '^@engine(.*)$': '<rootDir>/src/engine$1',
        '^@file-client(.*)$': '<rootDir>/src/file-client$1',
        '^@progress-logger(.*)$': '<rootDir>/src/progress-logger$1',
        '^@ui(.*)$': '<rootDir>/src/ui$1',
    },
};
