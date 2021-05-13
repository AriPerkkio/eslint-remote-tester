import chalk from 'chalk';
import fetch from 'node-fetch';

export async function isRepositoryPublic(repository: string): Promise<boolean> {
    try {
        const response = await fetch(`https://github.com/${repository}`);
        const isPublic = response.status === 200;

        if (!isPublic) {
            console.log(
                chalk.yellow`https://github.com/${repository} HTTP${response.status}`
            );
        }

        return isPublic;
    } catch (_) {
        return false;
    }
}
