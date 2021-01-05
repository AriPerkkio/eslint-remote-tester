import fs from 'fs';
import { spawn } from 'node-pty';
import stripAnsi from 'strip-ansi';

import { Config, ConfigToValidate } from '@config/types';
import { CACHE_LOCATION, RESULTS_LOCATION } from '@file-client';

declare const console: { log: jest.Mock };

export const INTEGRATION_REPO_OWNER = 'AriPerkkio';
export const INTEGRATION_REPO_NAME =
    'eslint-remote-tester-integration-test-target';
export const REPOSITORY_CACHE = `${CACHE_LOCATION}/${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}`;

const LAST_RENDER_PATTERN = /(Results|Full log)[\s|\S]*/;
const ON_COMPLETE_PATTERN = /("onComplete": )"([\s|\S]*)"/;
const ESCAPED_NEWLINE_PATTERN = /\\n/g;

let idCounter = 0;

/**
 * Create temporary configuration file for integration test
 */
function createConfiguration(
    options: ConfigToValidate
): { name: string; cleanup: () => void } {
    const name = `./test/integration/integration.config-${idCounter++}.js`;

    const baseConfig: Config = require('./integration/base.config.js');
    const config = { ...baseConfig, ...options };

    // Passing function to config file is tricky
    // - Add it as string to JSON
    // - Remove double quotes around it from text converted JSON
    if (options.onComplete) {
        config.onComplete = options.onComplete.toString() as any;
    }

    const configText = JSON.stringify(config, null, 4)
        .replace(ON_COMPLETE_PATTERN, '$1$2')
        .replace(ESCAPED_NEWLINE_PATTERN, '\n');

    fs.writeFileSync(name, `module.exports=${configText}`, 'utf8');

    return { name, cleanup: () => fs.unlinkSync(name) };
}

/**
 * Spawn terminal and run the actual production build on it
 */
export async function runProductionBuild(
    options: ConfigToValidate = {}
): Promise<{ output: string[]; exitCode: number }> {
    const { name, cleanup } = createConfiguration(options);

    return new Promise((resolve, reject) => {
        const ptyProcess = spawn('node', ['dist', '--config', name], {
            cwd: process.cwd(),
            encoding: 'utf8',
            cols: 999, // Prevent word wrap
            rows: 999, // Prevent ink from erasing the screen
        });
        const output: string[] = [];
        ptyProcess.onData(data =>
            output.push(sanitizeStackTrace(stripAnsi(data)))
        );

        ptyProcess.onExit(({ exitCode }) => {
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

    const [results] = textOutput.match(LAST_RENDER_PATTERN) || [];
    const logs = textOutput.replace(results, '').split('\r\n').filter(Boolean);

    return logs.concat(results);
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
