const engine = require('./engine');
const client = require('./client');

(async function main() {
    console.clear();
    const files = await client.getFiles();

    const results = [];
    for (const file of files) {
        const result = await engine.lintText(file);
        results.push(...result);
    }

    const messages = results.reduce(
        (all, result) => [...all, ...result.messages],
        []
    );
    console.log(messages);
})();
