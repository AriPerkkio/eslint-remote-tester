import { ComparisonResults, Result } from './result-templates';

/**
 * A single source for the scan's results
 */
class ResultsStore {
    private results: Result[] = [];
    private comparisonResults: ComparisonResults | null = null;

    addResults(...results: Result[]) {
        this.results.push(...results);
    }

    getResults() {
        return this.results;
    }

    setComparisonResults(comparisonResults: ComparisonResults) {
        this.comparisonResults = comparisonResults;
    }

    getComparisonResults() {
        return this.comparisonResults;
    }
}

export default new ResultsStore();
