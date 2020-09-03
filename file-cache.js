const fs = require('fs');
const nodePath = require('path');

const LOCATION = './.cache-eslint-repo-tester';
const INVALID_PREFIXES = ['.', '/', '\\'];
const ENCODING = 'utf8';

if (!fs.existsSync(LOCATION)) {
    fs.mkdirSync(LOCATION);
}

function createCacheHandle(method) {
    return async function cacheHandle(path, ...args) {
        if (!path) throw new Error('Path is required');

        if (INVALID_PREFIXES.includes(path[0])) {
            throw new Error(`Path cannot start with ${path[0]}, Path: ${path}`);
        }

        const fileLocation = `${LOCATION}/${path}`;
        if (fs.existsSync(fileLocation)) {
            console.log(`Cache hit: ${path}`);
            return fs.readFileSync(fileLocation, ENCODING);
        }

        const dir = nodePath.dirname(fileLocation);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        try {
            const content = await method(path, ...args);
            fs.writeFileSync(fileLocation, content, ENCODING);
            return content;
        } catch (e) {
            return e.message;
        }
    };
}

module.exports = {
    createCacheHandle,
    INVALID_PREFIXES,
};
