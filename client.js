const fetch = require('node-fetch');
const { createCacheHandle, INVALID_PREFIXES } = require('./file-cache');

const root = 'https://api.github.com/repos';
const repo = 'AriPerkkio/state-mgmt-examples';
const branch = 'master';

const cachedFetch = createCacheHandle((path, url) => {
    console.log(`GET ${url}`);

    return fetch(url)
        .then(res => {
            if (res.ok) return res.json();
            throw new Error(`Failed to fetch ${path}, HTTP${res.status}`);
        })
        .then(json => Buffer.from(json.content, 'base64').toString('utf8'))
        .catch(error => error);
});

async function getSha() {
    const method = () =>
        fetch(`${root}/${repo}/branches/${branch}`)
            .then(res => {
                if (res.ok) return res;
                console.error('SHA request failed', res.status);
            })
            .then(r => r.json())
            .then(json => json.commit.sha);

    return createCacheHandle(method)(`${repo}/sha`);
}

async function getAllFilesByExtension(ext) {
    const sha = await getSha();
    const url = `${root}/${repo}/git/trees/${sha}?recursive=true`;

    return fetch(url)
        .then(res => {
            if (res.ok) return res;
            throw Error('Response not ok', res.status);
        })
        .then(res => res.json())
        .then(json => {
            return json.tree
                .filter(file => file.type === 'blob')
                .filter(file => {
                    return (
                        file.path.endsWith(ext) &&
                        !INVALID_PREFIXES.includes(file.path[0])
                    );
                })
                .map(({ path, url }) => ({ path: `${repo}/${path}`, url }));
        })
        .catch(console.error);
}

async function getFileContents(files) {
    let contents = [];

    for (const file of files) {
        const content = await cachedFetch(file.path, file.url);
        contents.push(content);
    }

    return contents;
}

module.exports = {
    getFiles: async function getFiles() {
        const tsFiles = await getAllFilesByExtension('.js');
        const validFiles = tsFiles.filter(file => file.path && file.url);
        return await getFileContents(validFiles);
    },
};
