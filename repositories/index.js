const repositories = require('./repositories.json');
const pathIgnorePatterns = require('./pathIgnorePatterns');

function getRepositories(options) {
    const { randomize } = options || {};

    return randomize ? shuffle(repositories) : repositories;
}

function getPathIgnorePattern() {
    return pathIgnorePatterns;
}

function shuffle(array) {
    return array
        .map(value => ({ value, order: Math.random() }))
        .sort((a, b) => a.order - b.order)
        .map(({ value }) => value);
}

module.exports = {
    getRepositories,
    getPathIgnorePattern,
};
