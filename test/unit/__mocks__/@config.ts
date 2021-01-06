const DEFAULT_MOCK_CONFIG = {
    repositories: ['mock-repo-1', 'mock-repo-2', 'mock-repo-3'],
    logLevel: 'verbose',
};

export const mockConfig = jest.fn().mockReturnValue(DEFAULT_MOCK_CONFIG);
export const restoreMockConfig = (): void => {
    mockConfig.mockReturnValue(DEFAULT_MOCK_CONFIG);
};

export default new Proxy(mockConfig, {
    get: (target, prop) => (target() || {})[prop],
});

export const validateConfig = jest.fn().mockResolvedValue(undefined);
