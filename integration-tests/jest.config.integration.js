module.exports = {
    ...require('../jest.config'),
    roots: ['.'],
    setupFilesAfterEnv: ['./jest.setup.ts'],
};
