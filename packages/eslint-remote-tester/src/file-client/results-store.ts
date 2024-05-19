import { type ComparisonResults, type Result } from './result-templates.js';

/**
 * A single source for the scan's results
 */
class ResultsStore {
    private results: Result[] = [];
    private comparisonResults: ComparisonResults | null = null;

    addResults(...results: Result[]) {
        results.forEach(result => this.results.push(result));
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
