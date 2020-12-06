const baseConfig = require('../base.config');

module.exports = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        plugins: ['cypress'],
        extends: ['plugin:cypress/recommended'],
        rules: {
            'cypress/no-force': 'error',
            'cypress/assertion-before-screenshot': 'error',
            'cypress/require-data-selectors': 'error',
        },
    },
};
