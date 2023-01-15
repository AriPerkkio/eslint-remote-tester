/**
 * eslint-configs and eslint-plugins are handled the same way here.
 * Both are called plugins in this context.
 *
 * Before running this file, ensure that:
 *
 * 1. You are using yarn
 * 2. You have run "yarn install && yarn build" on ./ and ./repositories
 * 3. After the previous step you have run "yarn install" on ./ci
 *
 * If you need to regenerate the output quickly, without rerunning the tests, set the SKIP_TESTS env variable
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

type EslintPlugin = string & { readonly _: unique symbol };

const packageJson = require(path.resolve(__dirname, './package.json'));
const devDependencies: Record<EslintPlugin, unknown> =
    packageJson.devDependencies;

const CONFIG_PATH = (plugin: EslintPlugin) =>
    path.resolve(`${__dirname}/plugin-configs/${plugin}.config.ts`);
const WORKFLOW_DIR = path.resolve(`${__dirname}/../.github/workflows`);
const WORKFLOW_PREFIX = 'lint-';
const WORKFLOW_PATH = (plugin: EslintPlugin) =>
    `${WORKFLOW_DIR}/${WORKFLOW_PREFIX}${plugin}.yml`;
const WORKFLOW_LINK = (plugin: EslintPlugin) =>
    `https://github.com/AriPerkkio/eslint-remote-tester/actions/workflows/${WORKFLOW_PREFIX}${plugin}.yml`;
const WORKFLOW_BADGE = (plugin: EslintPlugin) =>
    `[![${plugin}](https://github.com/AriPerkkio/eslint-remote-tester/workflows/${plugin}/badge.svg)](${WORKFLOW_LINK(
        plugin
    )})`;

// prettier-ignore
const WORKFLOW_TEMPLATE = ({ plugin, index }: { plugin: EslintPlugin, index: number }) =>
`# This file is auto-generated. See ci/generate-workflows.ts
name: ${plugin}

on:
    workflow_dispatch: # Manual triggers
    workflow_run:
        workflows:
            - Run all plugin workflows
        types:
            - completed
    schedule:
        # First day of the month at ${generateHours(index)}:00
        - cron: '0 ${generateHours(index)} 1 * *'

jobs:
    lint:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: ./.github/actions/smoke-test
              with:
                  config: ${plugin}
`;

function generateHours(index: number) {
    if (index > 23) {
        throw new Error(
            'generateHours does not support hours above 24. Not implemented'
        );
    }

    return `${index > 9 ? '' : '0'}${index}`;
}

function formatPluginName(plugin: EslintPlugin): EslintPlugin {
    return (
        plugin
            // Next-js plugin to "eslint-plugin-next"
            .replace('@next/', '')

            // Generic handling for other scoped plugins, e.g. typescript-eslint
            .replace(/\//g, '-')
            .replace(/@/g, '') as EslintPlugin
    );
}

function validateConfigsExist(plugins: EslintPlugin[]) {
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

function generateWorkflows(plugins: EslintPlugin[]) {
    plugins.forEach((plugin, index) => {
        const path = WORKFLOW_PATH(plugin);
        fs.writeFileSync(path, WORKFLOW_TEMPLATE({ plugin, index }), 'utf8');

        console.log(`Generated ${path}`);
    });
}

function printBadgeMarkdown(plugins: EslintPlugin[]) {
    const markdown = plugins.map(WORKFLOW_BADGE);

    console.log(`\nMarkdown: \n${markdown.join('\n')}`);
}

function testPlugins(plugins: EslintPlugin[]) {
    plugins.forEach(plugin => {
        const cmd = `yarn lint --config ./plugin-configs/${plugin}.config.ts`;
        console.log(`> ${cmd}`);

        execSync(cmd, {
            stdio: 'inherit',
            cwd: path.resolve(__dirname),
            env: { ...process.env, PLUGIN_TEST: 'true' },
        });
    });
}

const dependencies = Object.keys(devDependencies) as Array<
    keyof typeof devDependencies
>;
const plugins = dependencies
    .filter(dep => /eslint-(plugin|config)/.test(dep))
    .map(formatPluginName)
    .sort();

// ESLint core rules, eslint:all
plugins.push('eslint-core' as EslintPlugin);
plugins.push('eslint-core-ts' as EslintPlugin);

if (!process.env.SKIP_TESTS) validateConfigsExist(plugins);
if (!process.env.SKIP_TESTS) testPlugins(plugins);
cleanPreviousWorkflow();
generateWorkflows(plugins);
printBadgeMarkdown(plugins);
