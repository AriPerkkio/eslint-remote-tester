import { describe, expect, test } from 'vitest';
import { getRepositories, getPathIgnorePattern } from '../src';

describe('getRepositories', () => {
    test('is function', () => {
        expect(typeof getRepositories).toBe('function');
    });

    test('returns list of strings', () => {
        const repositories = getRepositories();

        repositories.forEach(repository => {
            expect(typeof repository).toBe('string');
        });
    });

    test('returns non-empty list', () => {
        const repositories = getRepositories();
        expect(repositories.length).toBeGreaterThan(0);
    });

    test('repositories match format of <org>/<repository>', () => {
        const repositories = getRepositories();
        const pattern = /\S+\/\S+/;

        repositories.forEach(repository => {
            expect(repository).toMatch(pattern);
        });
    });

    test('contains unique entries', () => {
        const repositories = getRepositories();
        const duplicates = repositories.filter(
            (item, index, items) => items.indexOf(item) !== index
        );

        expect(duplicates).toHaveLength(0);
    });

    test('returns randomized list when options.randomize is enabled', () => {
        const first = getRepositories({ randomize: true });
        const second = getRepositories();

        // Should include same repositories
        expect(first).toHaveLength(second.length);
        first.forEach(repository => {
            expect(second).toContain(repository);
        });

        // Order should not be equal
        expect(first).not.toStrictEqual(second);
    });
});

describe('getPathIgnorePattern', () => {
    test('is function', () => {
        expect(typeof getPathIgnorePattern).toBe('function');
    });

    test('returns non-empty string', () => {
        const pathIgnorePattern = getPathIgnorePattern();

        expect(typeof pathIgnorePattern).toBe('string');
        expect(pathIgnorePattern.length).toBeGreaterThan(0);
    });

    test('returns valid string for RegExp constructor', () => {
        const pathIgnorePattern = getPathIgnorePattern();

        new RegExp(pathIgnorePattern);
    });
});
