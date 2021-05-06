import chalk from 'chalk';
import fetch from 'node-fetch';

export async function isRepositoryPublic(repository: string): Promise<boolean> {
    try {
        console.log(chalk.yellow`Requesting https://github.com/${repository}`);

        const response = await fetch(`https://github.com/${repository}`);
        const isPublic = response.status !== 404;

        if (!isPublic) {
            console.log(chalk.yellow`${repository} is private`);
        }

        return isPublic;
    } catch (_) {
        return false;
    }
}
