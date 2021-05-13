import chalk from 'chalk';
import fetch from 'node-fetch';

const MAX_RETRIES = 25;
const RETRY_SLEEP_SECONDS = 10;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function isRepositoryPublic(
    repository: string,
    retryCount = 0
): Promise<boolean> {
    try {
        const response = await fetch(`https://github.com/${repository}`);

        if (response.status === 429) {
            console.log(chalk.red`Reached rate limit`);

            if (retryCount === MAX_RETRIES) {
                console.log(
                    chalk.red`Maximum retry count reached (${repository})`
                );
                return false;
            }

            console.log(
                chalk.yellow`Sleeping for ${RETRY_SLEEP_SECONDS}s. Retry ${
                    retryCount + 1
                }/${MAX_RETRIES}`
            );
            await sleep(RETRY_SLEEP_SECONDS * 1000);

            return isRepositoryPublic(repository, retryCount + 1);
        } else if (retryCount > 0) {
            console.log(
                chalk.green`Recovered from rate limit. Retried ${retryCount} times`
            );
        }

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
