const baseConfig = require('../base.config');

module.exports = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extends: ['airbnb', 'airbnb/hooks', 'airbnb/whitespace'],
    },
};
