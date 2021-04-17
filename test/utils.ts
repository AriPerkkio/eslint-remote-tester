import fs from 'fs';
import { spawn } from 'node-pty';
import stripAnsi from 'strip-ansi';

import {
    CACHE_LOCATION,
    RESULTS_LOCATION,
    RESULTS_COMPARE_LOCATION,
} from '@file-client';
import { ComparisonTypes } from '@file-client/result-templates';
import { Config, ConfigToValidate } from '@config/types';

declare const console: { log: jest.Mock };

export const INTEGRATION_REPO_OWNER = 'AriPerkkio';
export const INTEGRATION_REPO_NAME =
    'eslint-remote-tester-integration-test-target';
export const REPOSITORY_CACHE = `${CACHE_LOCATION}/${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}`;

const LAST_RENDER_PATTERN = /(Results|Full log)[\s|\S]*/;
const COMPARISON_RESULTS_PATTERN = /(Comparison results:[\s|\S]*)Results/;
const ON_COMPLETE_PATTERN = /("onComplete": )"([\s|\S]*)"/;
const RULES_UNDER_TESTING_PATTERN = /("rulesUnderTesting": )"([\s|\S]*)",/;
const ESCAPED_NEWLINE_PATTERN = /\\n/g;

let idCounter = 0;

/**
 * Create temporary configuration file for integration test
 */
function createConfiguration(
    options: ConfigToValidate,
    baseConfigPath = './integration/base.config.js'
): { name: string; cleanup: () => void } {
    const name = `./test/integration/integration.config-${idCounter++}.js`;

    const baseConfig: Config = require(baseConfigPath);
    const config = { ...baseConfig, ...options };

    // Passing function to config file is tricky
    // - Add it as string to JSON
    // - Remove double quotes around it from text converted JSON
    if (options.onComplete) {
        config.onComplete = options.onComplete.toString() as any;
    }
    if (typeof options.rulesUnderTesting === 'function') {
        config.rulesUnderTesting = options.rulesUnderTesting.toString() as any;
    }

    const configText = JSON.stringify(config, null, 4)
        .replace(ON_COMPLETE_PATTERN, '$1$2')
        .replace(RULES_UNDER_TESTING_PATTERN, '$1$2,')
        .replace(ESCAPED_NEWLINE_PATTERN, '\n');

    fs.writeFileSync(name, `module.exports=${configText}`, 'utf8');

    return { name, cleanup: () => fs.unlinkSync(name) };
}

/**
 * Spawn terminal and run the actual production build on it
 */
export async function runProductionBuild(
    options: ConfigToValidate = {},
    baseConfigPath?: string
): Promise<{ output: string[]; exitCode: number }> {
    const { name, cleanup } = createConfiguration(options, baseConfigPath);

    return new Promise((resolve, reject) => {
        const debugLog = '/tmp/test.debug.log';
        if (fs.existsSync(debugLog)) fs.unlinkSync(debugLog);

        const debugStream = fs.createWriteStream(debugLog, {
            encoding: 'utf8',
        });

        const ptyProcess = spawn('node', ['dist', '--config', name], {
            cwd: process.cwd(),
            encoding: 'utf8',
            cols: 999, // Prevent word wrap
            rows: 999, // Prevent ink from erasing the screen,
            env: { ...process.env, NODE_OPTIONS: '--max_old_space_size=5120' },
        });
        const output: string[] = [];
        ptyProcess.onData(data => {
            debugStream.write(stripAnsi(data));
            output.push(sanitizeStackTrace(stripAnsi(data)));
        });

        ptyProcess.onExit(({ exitCode }) => {
            debugStream.end();
            cleanup();

            const parsedOutput = parsePtyOutput(output);

            // Identify any 'failed to' messages - these are not expected during
            // testing but can happen due to unstable network etc.
            const failureSteps = parsedOutput
                .filter(row => /failed to /.test(row))
                .join('\n');

            if (failureSteps) {
                reject(new Error(failureSteps));
            } else {
                resolve({ output: parsedOutput, exitCode });
            }
        });
    });
}

/**
 * Get call arguments of `console.log`
 */
export function getConsoleLogCalls(): string[] {
    const calls: string[][] = console.log.mock.calls;
    console.log.mockClear();

    return calls.map(argumentArray => argumentArray[0]);
}

/**
 * Sanitize possible stack traces for sensitive paths
 * - Removes absolute root path from stack traces, e.g.
 *   `/home/username/path/to/project/...` -> `<removed>/...`
 * - Guarantees identical stack traces between environments
 */
function sanitizeStackTrace(message?: string): string {
    return (message || '').replace(new RegExp(process.cwd(), 'g'), '<removed>');
}

/**
 * Output provided by node-pty is not stable. Sometimes longer prints are
 * split on multiple 'onData' calls, sometimes they are on a single print.
 *
 * - Construct proper consistent render output of node-pty's output
 */
function parsePtyOutput(output: string[]): string[] {
    // Discard first and last line, these may contain "debugger attached" messages
    const textOutput = output.slice(1, output.length - 1).join('');

    const [, comparisonResults] =
        textOutput.match(COMPARISON_RESULTS_PATTERN) || [];
    const [results] = textOutput.match(LAST_RENDER_PATTERN) || [];
    const logs = textOutput.replace(results, '').split('\r\n').filter(Boolean);

    return logs.concat(...[comparisonResults, results].filter(Boolean));
}

/**
 * Remove possible result caches
 */
export function clearResultsCache(): void {
    if (fs.existsSync(REPOSITORY_CACHE)) {
        fs.rmdirSync(REPOSITORY_CACHE, { recursive: true });
    }
}

/**
 * Get scan results from file system
 */
export function getResults(ext: '.md' | '' = '.md'): string {
    const filename = `${RESULTS_LOCATION}/${INTEGRATION_REPO_OWNER}_${INTEGRATION_REPO_NAME}${ext}`;

    if (!fs.existsSync(filename)) {
        const files = fs.readdirSync(RESULTS_LOCATION).join(', ');
        throw new Error(
            `${filename} not found at ${RESULTS_LOCATION}: [${files}]`
        );
    }

    return sanitizeStackTrace(fs.readFileSync(filename, 'utf8'));
}

/**
 * Get comparison results from file system
 */
export function getComparisonResults(
    ext: '.md' | '' = '.md'
): Record<typeof ComparisonTypes[number], string> {
    return ComparisonTypes.reduce(
        (results, type) => {
            const filename = `${RESULTS_COMPARE_LOCATION}/${type}${ext}`;

            if (!fs.existsSync(filename)) {
                return results;
            }

            return {
                ...results,
                [type]: sanitizeStackTrace(fs.readFileSync(filename, 'utf8')),
            };
        },
        { added: '', removed: '' }
    );
}
