import { writeFileSync } from 'fs';
import { resolve } from 'path';

import repositories from '../src/repositories.json';

const repositoriesToRemove: string[] = process.argv.slice(2);

const newRepositories: string[] = repositories.filter(repository => {
    return !repositoriesToRemove.includes(repository);
});

console.log(`Removing ${repositoriesToRemove.length} repositories`);
console.log(`Before ${repositories.length}. After ${newRepositories.length}`);

writeFileSync(
    resolve(__dirname, '../src/repositories.json'),
    JSON.stringify(newRepositories, null, 4),
    'utf8'
);
