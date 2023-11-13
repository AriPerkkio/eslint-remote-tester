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
        '^@config(.*)$': '<rootDir>/lib/config$1',
        '^@engine(.*)$': '<rootDir>/lib/engine$1',
        '^@file-client(.*)$': '<rootDir>/lib/file-client$1',
        '^@progress-logger(.*)$': '<rootDir>/lib/progress-logger$1',
        '^@ui(.*)$': '<rootDir>/lib/ui$1',
    },
};
