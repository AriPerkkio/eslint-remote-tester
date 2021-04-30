import { writeFileSync } from 'fs';
import { resolve } from 'path';

import repos from '../src/repositories.json';

const uniqueRepos = repos.filter(
    (item, index, array) => array.indexOf(item) === index
);

console.log(
    `Repositories ${repos.length}\nUnique repositories ${uniqueRepos.length}`
);

writeFileSync(
    resolve(__dirname, '../src/repositories.json'),
    JSON.stringify(uniqueRepos, null, 4),
    'utf8'
);
