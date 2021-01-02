export default {
    repositories: ['mock-repo-1', 'mock-repo-2', 'mock-repo-3'],
    logLevel: 'verbose',
};

export const validateConfig = jest.fn().mockResolvedValue(undefined);
