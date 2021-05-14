import fs from 'fs';

import {
    cloneRepository,
    getCacheStatus,
    removeCachedRepository,
} from '@file-client/repository-client';
import SimpleGit from '__mocks__/simple-git';

const EXPECTED_CACHE = './node_modules/.cache-eslint-remote-tester';

describe('repository-client', () => {
    beforeEach(() => {
        SimpleGit().clone.mockClear();
        SimpleGit().pull.mockClear();

        // Clear previous cache
        if (fs.existsSync(EXPECTED_CACHE)) {
            fs.rmdirSync(EXPECTED_CACHE, { recursive: true });
        }

        // Initialize client
        jest.resetModuleRegistry();
        jest.isolateModules(() => {
            require('../../lib/file-client/repository-client');
        });
    });

    test('creates cache directory', () => {
        expect(fs.existsSync(EXPECTED_CACHE)).toBe(true);
        expect(fs.statSync(EXPECTED_CACHE).isDirectory()).toBe(true);
    });

    describe('cloneRepository', () => {
        test('clones repositories into cache', async () => {
            const repository = 'mock-user/mock-repository';

            await cloneRepository({
                repository,
                onClone: jest.fn(),
                onCloneFailure: jest.fn(),
                onPull: jest.fn(),
                onPullFailure: jest.fn(),
            });

            expect(
                SimpleGit().clone
            ).toHaveBeenCalledWith(
                'https://github.com/mock-user/mock-repository.git',
                `${EXPECTED_CACHE}/${repository}`,
                { '--depth': 1 }
            );
        });
    });

    describe('removeCachedRepository', () => {
        test('removes repository from cache', async () => {
            const repository = 'mock-repository';

            fs.mkdirSync(`${EXPECTED_CACHE}/${repository}`);
            fs.writeFileSync(`${EXPECTED_CACHE}/${repository}/index.js`, '//');

            await removeCachedRepository(repository);

            expect(fs.existsSync(`${EXPECTED_CACHE}/${repository}`)).toBe(
                false
            );
        });
    });

    describe('getCacheStatus', () => {
        test('returns count of repositories', () => {
            fs.mkdirSync(`${EXPECTED_CACHE}/user-1`);
            fs.mkdirSync(`${EXPECTED_CACHE}/user-1/repository-1`);
            fs.mkdirSync(`${EXPECTED_CACHE}/user-1/repository-2`);
            fs.mkdirSync(`${EXPECTED_CACHE}/user-1/repository-3`);
            fs.mkdirSync(`${EXPECTED_CACHE}/user-1/repository-4`);

            fs.mkdirSync(`${EXPECTED_CACHE}/user-2`);
            fs.mkdirSync(`${EXPECTED_CACHE}/user-2/repository-1`);

            fs.mkdirSync(`${EXPECTED_CACHE}/user-3`);

            expect(getCacheStatus().countOfRepositories).toBe(5);
        });

        test('returns location of cache', () => {
            expect(getCacheStatus().location).toBe(EXPECTED_CACHE);
        });
    });
});
