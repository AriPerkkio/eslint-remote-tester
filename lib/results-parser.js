const fs = require('fs');

const RESULTS_LOCATION = './results';
if (!fs.existsSync(RESULTS_LOCATION)) {
    fs.mkdirSync(RESULTS_LOCATION);
}

const RESULT_TEMPLATE = result =>
    `Rule: ${result.ruleId}
Message: ${result.message}
Path: ${result.path}
${result.source}
`;

function formatResults(results) {
    return results.map(RESULT_TEMPLATE).join('\n');
}

/**
 * Write results to file at `./results`
 *
 * @param {Array.<{
 *  ruleId: String,
 *  message: String,
 *  path: String,
 *  source: String
 * }>} results Results to write
 * @param {String} repository Repository being scanned
 */
function writeResults(results, repository) {
    const [, repoName] = repository.split('/');

    const formattedResults = results.length
        ? formatResults(results)
        : 'No issues';

    fs.writeFileSync(
        `${RESULTS_LOCATION}/${repoName}`,
        formattedResults,
        'utf8'
    );
}

module.exports = { writeResults };
