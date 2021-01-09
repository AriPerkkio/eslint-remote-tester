import fs from 'fs';

import {
    prepareResultsDirectory,
    RESULTS_LOCATION,
    RESULTS_COMPARE_DIR,
} from '@file-client';

jest.unmock('@file-client');

const MOCK_RESULT_FILES = ['mock-result-one.md', 'mock-result-two.md'];
const MOCK_COMPARISON_FILES = ['added.md', 'removed.md'];

const createResultsDirectory = () => fs.mkdirSync(RESULTS_LOCATION);
const readResultsDirectory = () => fs.readdirSync(RESULTS_LOCATION);
const resultsDirectoryExists = () => fs.existsSync(RESULTS_LOCATION);
const createComparisonDirectory = () =>
    fs.mkdirSync(`${RESULTS_LOCATION}/${RESULTS_COMPARE_DIR}`);
const readComparisonDirectory = () =>
    fs.readdirSync(`${RESULTS_LOCATION}/${RESULTS_COMPARE_DIR}`);

function removeResultsDirectory(): void {
    if (resultsDirectoryExists()) {
        fs.rmdirSync(RESULTS_LOCATION, { recursive: true });
    }
}

function createResults(): void {
    removeResultsDirectory();
    createResultsDirectory();

    MOCK_RESULT_FILES.forEach(name =>
        fs.writeFileSync(`${RESULTS_LOCATION}/${name}`, 'Hello world', 'utf8')
    );
}

function createComparisonResults(): void {
    removeResultsDirectory();
    createResultsDirectory();
    createComparisonDirectory();

    MOCK_COMPARISON_FILES.forEach(name =>
        fs.writeFileSync(
            `${RESULTS_LOCATION}/${RESULTS_COMPARE_DIR}/${name}`,
            'Hello world',
            'utf8'
        )
    );
}

describe('file-client', () => {
    describe('prepareResultsDirectory', () => {
        afterEach(() => {
            removeResultsDirectory();
        });

        test('creates results directory when previous does not exist', () => {
            removeResultsDirectory();

            prepareResultsDirectory();

            expect(resultsDirectoryExists()).toBe(true);
        });

        test('empties results directory when previous exists', () => {
            createResults();
            const filesBefore = readResultsDirectory();

            prepareResultsDirectory();
            const filesAfter = readResultsDirectory();

            expect(filesAfter).not.toHaveLength(filesBefore.length);
            // Only comparison directory should exist
            expect(readResultsDirectory()).toHaveLength(1);
        });

        test('creates empty comparison directory when previous does not exist', () => {
            removeResultsDirectory();

            prepareResultsDirectory();

            expect(readResultsDirectory()).toEqual([RESULTS_COMPARE_DIR]);
        });

        test('empties comparison directory when previous exists', () => {
            createComparisonResults();

            prepareResultsDirectory();

            expect(readComparisonDirectory()).toHaveLength(0);
        });

        test.todo('does not remove results if called from worker thread');
    });
});
