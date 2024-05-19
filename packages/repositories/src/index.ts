import { pathIgnorePatterns } from './pathIgnorePatterns.js';
import repositories from './repositories.js';

const shuffle = <T>(array: T[]): T[] =>
    array
        .map(value => ({ value, order: Math.random() }))
        .sort((a, b) => a.order - b.order)
        .map(({ value }) => value);

export const getRepositories = ({
    randomize = false,
}: { randomize?: boolean } = {}): string[] =>
    randomize ? shuffle(repositories) : repositories;

export const getPathIgnorePattern = (): string => pathIgnorePatterns;
