const ESLint = require('eslint').ESLint;
const settings = require('./settings');

module.exports = new ESLint({ overrideConfig: settings });
