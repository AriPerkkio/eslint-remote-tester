import { SourceFile } from '@file-client';

export const writeResults = jest.fn();
export const prepareResultsDirectory = jest.fn();
export const removeCachedRepository = jest.fn();
export const getFilesMock = jest.fn();
export const getCacheStatus = () => ({
    countOfRepositories: 0,
    location: 'mock-cache',
});

export const ResultsStore = {
    getResults: jest.fn().mockReturnValue(['MOCK_RESULT']),
};

export async function getFiles(options: unknown): Promise<SourceFile[]> {
    getFilesMock(options);

    return [{ path: './mock/path/file.ts' }];
}
