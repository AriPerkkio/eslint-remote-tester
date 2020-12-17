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
const WORKFLOW_BADGE = plugin =>
    `![${plugin}](https://github.com/AriPerkkio/eslint-remote-tester/workflows/${plugin}/badge.svg)`;
const LINT_COMMAND = plugin =>
    `yarn lint --config ./plugin-configs/${plugin}.config.js`;

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
    - uses: actions/setup-node@v1
      with:
        node-version: 12.11
    - run: yarn install
    - run: yarn build
    - run: rm -rf ./node_modules
    - run: yarn install
      working-directory: ./ci
    - run: "yarn list | grep eslint"
      working-directory: ./ci
    - run: "yarn log --config ./plugin-configs/${plugin}.config.js"
      working-directory: ./ci
    - run: "${LINT_COMMAND(plugin)}"
      working-directory: ./ci
      env:
        CI: true
        NODE_OPTIONS: --max_old_space_size=5120
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
        execSync(LINT_COMMAND(plugin), {
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
