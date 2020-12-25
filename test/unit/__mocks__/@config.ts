export default {
    repositories: ['mock-repo-1', 'mock-repo-2', 'mock-repo-3'],
    concurrentTasks: 2222,
    logLevel: 'warn',
};

export const validateEslintrcRules = jest.fn().mockResolvedValue(undefined);
