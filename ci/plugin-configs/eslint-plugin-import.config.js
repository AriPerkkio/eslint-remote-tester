const baseConfig = require('../base.config');

module.exports = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extends: [
            'plugin:import/errors',
            'plugin:import/warnings',
            'plugin:import/typescript',
        ],
    },
};
