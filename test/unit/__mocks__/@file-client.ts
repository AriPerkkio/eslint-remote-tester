export const writeResults = jest.fn();
export const prepareResultsDirectory = jest.fn();
export const ResultsStore = {
    getResults: jest.fn().mockReturnValue(['MOCK_RESULT']),
};
