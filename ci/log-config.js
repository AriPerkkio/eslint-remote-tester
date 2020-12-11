const args = process.argv;
const indexOfConfig = args.indexOf('--config');

if (indexOfConfig === -1) {
    throw new Error('--config was not given');
}

const path = args[indexOfConfig + 1];
const rawConfig = require(path);

const repositories = rawConfig.repositories.length;
const pathIgnorePattern = rawConfig.pathIgnorePattern.split('|');
const config = { ...rawConfig, repositories, pathIgnorePattern };

console.log(`Configuration (${path})

${JSON.stringify(config, null, 4)}
`);
