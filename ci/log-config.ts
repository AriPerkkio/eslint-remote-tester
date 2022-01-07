import type { Config } from 'eslint-remote-tester';

const args = process.argv;
const indexOfConfig = args.indexOf('--config');

if (indexOfConfig === -1) {
    throw new Error('--config was not given');
}

const path = args[indexOfConfig + 1];
const rawConfig: Config = require(path).default;

const repositories = rawConfig.repositories.length;
const pathIgnorePattern = rawConfig.pathIgnorePattern.split('|');
const config = { ...rawConfig, repositories, pathIgnorePattern };

console.log(`Configuration (${path})

${stringify(config)}
`);

// https://gist.github.com/cowboy/3749767
function stringify(obj: unknown) {
    const placeholder = '____PLACEHOLDER____';
    const fns = [];
    let json = JSON.stringify(
        obj,
        function (_, value) {
            if (typeof value === 'function') {
                fns.push(value);
                return placeholder;
            }
            return value;
        },
        4
    );
    json = json.replace(new RegExp('"' + placeholder + '"', 'g'), () =>
        fns.shift()
    );
    return json;
}
