import repos from '../src/repositories.ts';
import { writeRepositories } from './utils.ts';

const uniqueRepos = repos.filter(
    (item, index, array) => array.indexOf(item) === index
);

console.log(
    `Repositories ${repos.length}\nUnique repositories ${uniqueRepos.length}`
);

writeRepositories(uniqueRepos);
