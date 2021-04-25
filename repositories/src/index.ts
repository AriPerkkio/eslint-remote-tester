import { pathIgnorePatterns } from './pathIgnorePatterns';
import repositories from './repositories.json';

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
