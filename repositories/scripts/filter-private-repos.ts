import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { isRepositoryPublic } from './utils';
import repositories from '../src/repositories.json';

const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));
const isCI = process.env.CI === 'true';

async function main() {
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
        return writeFileSync(
            resolve(__dirname, '../src/repositories.json'),
            JSON.stringify(publicRepositories, null, 4),
            'utf8'
        );
    }

    if (privateRepositories.length) {
        console.log('Private repositories:');
        privateRepositories.forEach(repository => console.log(repository));
        process.exit(1);
    }
}

main();
