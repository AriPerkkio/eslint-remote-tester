import { ResultTemplateOptions } from './result-templates';

/**
 * A single source for the scan's results
 */
class ResultsStore {
    private results: ResultTemplateOptions[] = [];

    addResults(...results: ResultTemplateOptions[]) {
        this.results.push(...results);
    }

    getResults() {
        return this.results;
    }
}

export default new ResultsStore();
