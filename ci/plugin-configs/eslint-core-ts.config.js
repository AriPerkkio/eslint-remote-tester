const baseConfig = require('../base.config');

module.exports = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extends: ['eslint:all'],
        rules: {
            // Crashes with typescript: "enum A { 'B' = 'C' }"
            'no-unused-vars': 'off',
        },
    },
};
