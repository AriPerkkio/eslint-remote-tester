import { Result } from './result-templates';

/**
 * A single source for the scan's results
 */
class ResultsStore {
    private results: Result[] = [];

    addResults(...results: Result[]) {
        this.results.push(...results);
    }

    getResults() {
        return this.results;
    }
}

export default new ResultsStore();
