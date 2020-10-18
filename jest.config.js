module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['test'],
  testPathIgnorePatterns: ["test/integration"],
  verbose: true,
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
  moduleDirectories: [
    'node_modules',
    require('./tsconfig.json').compilerOptions.baseUrl,
  ],
};