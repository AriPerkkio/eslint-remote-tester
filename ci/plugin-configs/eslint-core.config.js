const baseConfig = require('../base.config');

module.exports = {
    ...baseConfig,
    extensions: ['js', 'jsx'],
    eslintrc: {
        ...baseConfig.eslintrc,
        parser: undefined,
        extends: ['eslint:all'],
    },
};
