/**
 * eslint-configs and eslint-plugins are handled the same way here.
 * Both are called plugins in this context.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_PATH = plugin =>
    path.resolve(`${__dirname}/plugin-configs/${plugin}.config.js`);
const WORKFLOW_DIR = path.resolve(`${__dirname}/../.github/workflows`);
const WORKFLOW_PREFIX = 'lint-';
const WORKFLOW_PATH = plugin =>
    `${WORKFLOW_DIR}/${WORKFLOW_PREFIX}${plugin}.yml`;
const WORKFLOW_LINK = plugin =>
    `https://github.com/AriPerkkio/eslint-remote-tester/actions?query=workflow%3A${plugin}`;
const WORKFLOW_BADGE = plugin =>
    `[![${plugin}](https://github.com/AriPerkkio/eslint-remote-tester/workflows/${plugin}/badge.svg)](${WORKFLOW_LINK(
        plugin
    )})`;

// prettier-ignore
const WORKFLOW_TEMPLATE = ({ plugin, index }) =>
`# This file is auto-generated. See ci/generate-workflows.js
name: ${plugin}

on:
    workflow_dispatch: # Manual triggers
    workflow_run:
        workflows:
            - Run all plugin workflows
        types:
            - completed
    schedule:
        # Every thursday at ${generateHours(index)}:00
        - cron: '0 ${generateHours(index)} * * THU'

jobs:
    lint:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2
            - uses: actions/setup-node@v2
              with:
                  node-version: 14
            - run: |
                  yarn install
                  yarn build
                  rm -rf ./node_modules
            - run: |
                  yarn install
                  yarn build
                  rm -rf ./node_modules
              working-directory: ./repositories
            - run: |
                  yarn install
                  yarn list | grep eslint
                  yarn log --config ./plugin-configs/${plugin}.config.js
              working-directory: ./ci
            - uses: AriPerkkio/eslint-remote-tester-run-action@v1
              with:
                  working-directory: ./ci
                  issue-title: 'Weekly scheduled smoke test: ${plugin}'
                  eslint-remote-tester-config: plugin-configs/${plugin}.config.js
`;

function generateHours(index) {
    if (index > 23) {
        throw new Error(
            'generateHours does not support hours above 24. Not implemented'
        );
    }

    return `${index > 9 ? '' : '0'}${index}`;
}

function formatPluginName(plugin) {
    return plugin.replace(/\//g, '-').replace(/@/g, '');
}

function validateConfigsExist(plugins) {
    const missingConfigs = plugins.filter(
        plugin => !fs.existsSync(CONFIG_PATH(plugin))
    );

    if (missingConfigs.length) {
        throw new Error(
            `Missing configurations:\n${missingConfigs
                .map(CONFIG_PATH)
                .join('\n')}`
        );
    }
}

function cleanPreviousWorkflow() {
    const workflows = fs
        .readdirSync(WORKFLOW_DIR)
        .filter(w => w.startsWith(WORKFLOW_PREFIX));

    workflows.forEach(workflow => {
        const path = `${WORKFLOW_DIR}/${workflow}`;
        fs.unlinkSync(path);
        console.log(`Removed ${path}`);
    });
}

function generateWorkflows(plugins) {
    plugins.forEach((plugin, index) => {
        const path = WORKFLOW_PATH(plugin);
        fs.writeFileSync(path, WORKFLOW_TEMPLATE({ plugin, index }), 'utf8');

        console.log(`Generated ${path}`);
    });
}

function printBadgeMarkdown(plugins) {
    const markdown = plugins.map(WORKFLOW_BADGE);

    console.log(`\nMarkdown: \n${markdown.join('\n')}`);
}

function testPlugins(plugins) {
    plugins.forEach(plugin => {
        execSync(`yarn lint --config ./plugin-configs/${plugin}.config.js`, {
            stdio: 'inherit',
            cwd: path.resolve(__dirname),
        });
    });
}

const dependencies = Object.keys(require('./package.json').devDependencies);
const plugins = dependencies
    .filter(dep => /eslint-(plugin|config)/.test(dep))
    .map(formatPluginName)
    .sort();

// ESLint core rules, eslint:all
plugins.push('eslint-core');
plugins.push('eslint-core-ts');

validateConfigsExist(plugins);
testPlugins(plugins);
cleanPreviousWorkflow(plugins);
generateWorkflows(plugins);
printBadgeMarkdown(plugins);
