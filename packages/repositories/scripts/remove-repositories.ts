import repositories from '../src/repositories';
import { writeRepositories } from './utils';

const repositoriesToRemove: string[] = process.argv.slice(2);

const newRepositories: string[] = repositories.filter(repository => {
    return !repositoriesToRemove.includes(repository);
});

console.log(`Removing ${repositoriesToRemove.length} repositories`);
console.log(`Before ${repositories.length}. After ${newRepositories.length}`);

writeRepositories(newRepositories);
