const baseConfig = require('../base.config');

module.exports = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extends: ['plugin:@next/next/recommended'],

        // TODO: Search for src/pages and enable this rule if found
        rules: {
            '@next/next/no-html-link-for-pages': 'off',
        },
    },
};
