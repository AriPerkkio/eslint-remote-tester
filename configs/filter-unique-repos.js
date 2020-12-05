const fs = require('fs');
const repos = require('./repositories.json');

const filterUnique = (item, index, array) => array.indexOf(item) === index;
const unique = repos.filter(filterUnique);

console.log(
    `Repositories ${repos.length}\nUnique repositories ${unique.length}`
);

fs.writeFileSync(
    './repositories.json',
    JSON.stringify(unique, null, 4),
    'utf8'
);
