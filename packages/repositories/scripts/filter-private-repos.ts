import { isRepositoryPublic, writeRepositories } from './utils.ts';
import repositories from '../src/repositories.ts';

const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));
const isCI = process.env.CI === 'true';

const publicRepositories: string[] = [];
const privateRepositories: string[] = [];

for (const repository of repositories) {
    const isPublic = await isRepositoryPublic(repository);

    if (isPublic) {
        publicRepositories.push(repository);
    } else {
        privateRepositories.push(repository);
    }

    sleep(100);
}

console.log(
    [
        '',
        `Repositories ${repositories.length}`,
        `Public repositories ${publicRepositories.length}`,
        `Private repositories: ${privateRepositories.length}`,
        '',
    ].join('\n')
);

if (!isCI) {
    writeRepositories(publicRepositories);
}

if (privateRepositories.length) {
    console.log('Private repositories:');
    privateRepositories.forEach(repository => console.log(repository));
    process.exit(1);
}
