import { writeFileSync } from 'fs';

import repos from '../src/repositories.json';

const uniqueRepos = repos.filter(
    (item, index, array) => array.indexOf(item) === index
);

console.log(
    `Repositories ${repos.length}\nUnique repositories ${uniqueRepos.length}`
);

writeFileSync(
    '../src/repositories.json',
    JSON.stringify(uniqueRepos, null, 4),
    'utf8'
);
