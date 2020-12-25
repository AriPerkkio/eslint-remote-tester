export const writeResults = jest.fn();
export const clearResults = jest.fn();
export const ResultsStore = {
    getResults: jest.fn().mockReturnValue(['MOCK_RESULT']),
};
