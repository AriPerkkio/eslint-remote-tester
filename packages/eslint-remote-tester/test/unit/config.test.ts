import { getConsoleLogCalls } from '../utils';
import { loadTSConfig } from '@config/load';
import validateConfig from '@config/validator';
import {
    Config,
    ConfigWithOptionals,
    LogLevel,
    ResultParser,
} from '@config/types';

jest.unmock('@config');
jest.unmock('eslint');

const DEFAULT_CONFIGURATION: ConfigWithOptionals = {
    repositories: ['test-repo', 'test-repo-2'],
    extensions: ['ts', 'tsx'],
    eslintrc: { root: true },
    rulesUnderTesting: undefined,
    pathIgnorePattern: undefined,
    maxFileSizeBytes: undefined,
    resultParser: undefined,
    concurrentTasks: undefined,
    CI: undefined,
    cache: undefined,
    logLevel: undefined,
    timeLimit: undefined,
    compare: undefined,
    updateComparisonReference: undefined,
    onComplete: undefined,
};

const mockConfig = jest.fn().mockReturnValue(DEFAULT_CONFIGURATION);
jest.mock('../../eslint-remote-tester.config.js', () => mockConfig());

function getConfig(): Config {
    let config: Config;

    jest.isolateModules(() => {
        config = require('../../src/config/config').default;
    });

    return config!;
}

describe('config', () => {
    test('default values are set in CI mode', () => {
        mockConfig.mockReturnValue({ ...DEFAULT_CONFIGURATION, CI: true });
        const config = getConfig();

        expect(config.rulesUnderTesting).toStrictEqual([]);
        expect(config.resultParser).toBe('plaintext');
        expect(config.logLevel).toBe('verbose');
        expect(config.concurrentTasks).toBe(5);
        expect(config.maxFileSizeBytes).toBe(2e6);
        expect(config.timeLimit).toBe(5.5 * 60 * 60);
        expect(config.slowLintTimeLimit).toBe(null);
        expect(config.pathIgnorePattern).toBe(undefined);
        expect(config.cache).toBe(true);
        expect(config.compare).toBe(false);
        expect(config.updateComparisonReference).toBe(true);
        expect(config.onComplete).toBe(undefined);
    });

    test('default values are set in CLI mode', () => {
        mockConfig.mockReturnValue({ ...DEFAULT_CONFIGURATION, CI: false });
        const config = getConfig();

        expect(config.rulesUnderTesting).toStrictEqual([]);
        expect(config.resultParser).toBe('markdown');
        expect(config.logLevel).toBe('verbose');
        expect(config.concurrentTasks).toBe(5);
        expect(config.maxFileSizeBytes).toBe(2e6);
        expect(config.timeLimit).toBe(5.5 * 60 * 60);
        expect(config.slowLintTimeLimit).toBe(null);
        expect(config.pathIgnorePattern).toBe(undefined);
        expect(config.cache).toBe(true);
        expect(config.compare).toBe(false);
        expect(config.updateComparisonReference).toBe(true);
        expect(config.onComplete).toBe(undefined);
    });

    test('default value for CI is set', () => {
        mockConfig.mockReturnValue({ ...DEFAULT_CONFIGURATION, CI: undefined });
        const config = getConfig();

        expect(config.CI).toBe(process.env.CI === 'true');
    });

    test('resultParser option is used when provided', () => {
        mockConfig.mockReturnValue({
            ...DEFAULT_CONFIGURATION,
            CI: true,
            resultParser: 'markdown',
        });
        const config = getConfig();

        // Should use value from configuration, not default value resolved by CI flag
        expect(config.resultParser).toBe('markdown');
    });

    test('pathIgnorePattern is constructed into RegExp', () => {
        mockConfig.mockReturnValue({
            ...DEFAULT_CONFIGURATION,
            pathIgnorePattern: '(should-match-abc)',
        });
        const config = getConfig();

        expect(config.pathIgnorePattern).toBeTruthy();
        expect('should-match-abc').toMatch(config.pathIgnorePattern!);
        expect('should-not-match-def').not.toMatch(config.pathIgnorePattern!);
    });

    test('erroneous pathIgnorePattern is ignored', () => {
        mockConfig.mockReturnValue({
            ...DEFAULT_CONFIGURATION,
            pathIgnorePattern: '(forgot-to-close-pattern=.*?',
        });
        const config = getConfig();

        expect(config.pathIgnorePattern).toBe(undefined);
    });
});

describe('validateConfig', () => {
    describe('valid configuration options', () => {
        afterEach(() => {
            const validationErrors = getConsoleLogCalls();

            expect(validationErrors).toHaveLength(0);
            expect(process.exit).not.toHaveBeenCalled();
        });

        test('repositories accepts array with unique strings', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                repositories: ['a', 'b'],
            });
        });

        test('repositories accepts array with a single string', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                repositories: ['a'],
            });
        });

        test('extensions accepts array with unique strings', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                extensions: ['js', 'ts'],
            });
        });

        test('extensions accepts array with a single string', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                extensions: ['js'],
            });
        });

        test('eslintrc accepts valid eslint configuration', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                eslintrc: { rules: {} },
            });
        });

        test('eslintrc accepts function', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                eslintrc: () => ({ rules: {} }),
            });
        });

        test('rulesUnderTesting is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                rulesUnderTesting: undefined,
            });
        });

        test('rulesUnderTesting accepts empty array', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                rulesUnderTesting: [],
            });
        });

        test('rulesUnderTesting accepts array with unique strings', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                rulesUnderTesting: ['a', 'b'],
            });
        });

        test('rulesUnderTesting accepts array with a single string', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                rulesUnderTesting: ['a'],
            });
        });

        test('rulesUnderTesting accepts function', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                rulesUnderTesting: () => true,
            });
        });

        test('pathIgnorePattern is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                pathIgnorePattern: undefined,
            });
        });

        test('pathIgnorePattern accepts valid pattern', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                pathIgnorePattern: '(some-file\\.ts|other-file\\.ts)',
            });
        });

        test('maxFileSizeBytes is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                maxFileSizeBytes: undefined,
            });
        });

        test('maxFileSizeBytes accepts positive number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                maxFileSizeBytes: 1,
            });
        });

        test('resultParser is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                resultParser: undefined,
            });
        });

        test('resultParser accepts plaintext and markdown', async () => {
            const resultParsers: ResultParser[] = ['plaintext', 'markdown'];

            for (const resultParser of resultParsers) {
                await validateConfig({
                    ...DEFAULT_CONFIGURATION,
                    resultParser,
                });
            }
        });

        test('concurrentTasks is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                concurrentTasks: undefined,
            });
        });

        test('concurrentTasks accepts number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                concurrentTasks: 1,
            });
        });

        test('CI is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                CI: undefined,
            });
        });

        test('CI accepts boolean', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                CI: true,
            });
        });

        test('cache is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                cache: undefined,
            });
        });

        test('cache accepts boolean', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                cache: true,
            });
        });

        test('logLevel is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                logLevel: undefined,
            });
        });

        test('logLevel accepts verbose, info, warn and error', async () => {
            const logLevels: LogLevel[] = ['verbose', 'info', 'warn', 'error'];

            for (const logLevel of logLevels) {
                await validateConfig({ ...DEFAULT_CONFIGURATION, logLevel });
            }
        });

        test('timeLimit is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                timeLimit: undefined,
            });
        });

        test('timeLimit accepts positive number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                timeLimit: 1,
            });
        });

        test('slowLintTimeLimit is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                slowLintTimeLimit: undefined,
            });
        });

        test('slowLintTimeLimit accepts positive number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                slowLintTimeLimit: 1,
            });
        });

        test('compare is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                compare: undefined,
            });
        });

        test('compare accepts boolean', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                compare: true,
            });
        });

        test('updateComparisonReference is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                updateComparisonReference: undefined,
            });
        });

        test('updateComparisonReference accepts boolean', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                updateComparisonReference: true,
            });
        });

        test('onComplete is optional', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                onComplete: undefined,
            });
        });

        test('onComplete accepts function', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                onComplete: () => undefined,
            });
        });
    });

    describe('invalid configuration options', () => {
        afterEach(() => {
            expect(process.exit).toHaveBeenCalledTimes(1);
            expect(process.exit).toHaveBeenCalledWith(1);
        });

        test('error message is displayed', async () => {
            await validateConfig({});

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch('Configuration validation errors:');
        });

        test('unknown options are unsupported', async () => {
            const key = 'someMistypedKey';
            const config = { ...DEFAULT_CONFIGURATION, [key]: true };
            await validateConfig(config);

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                `- Options [${key}] are not supported`
            );
        });

        test('repositories are required', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                repositories: undefined,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch('Missing repositories.');
        });

        test('repositories requires an array', async () => {
            const repositories: any = { length: 10 };
            await validateConfig({ ...DEFAULT_CONFIGURATION, repositories });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch('repositories should be an array.');
        });

        test('repositories array should contain strings', async () => {
            const repositories: any = [
                'string',
                { value: 'invalid-structure' },
                'string-2',
            ];
            await validateConfig({ ...DEFAULT_CONFIGURATION, repositories });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'repositories should contain only strings'
            );
        });

        test('repositories should contain unique entries', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                repositories: [
                    'duplicate-1',
                    'valid',
                    'duplicate-1',
                    'duplicate-2',
                    'valid-2',
                    'duplicate-2',
                ],
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'repositories contains duplicate entries: [duplicate-1, duplicate-2]'
            );
        });

        test('extensions are required', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                extensions: undefined,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch('Missing extensions.');
        });

        test('extensions requires an array', async () => {
            const extensions: any = { length: 10 };
            await validateConfig({ ...DEFAULT_CONFIGURATION, extensions });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch('extensions should be an array.');
        });

        test('extensions array should contain strings', async () => {
            const extensions: any = [
                'js',
                { value: 'invalid-structure' },
                'ts',
            ];
            await validateConfig({ ...DEFAULT_CONFIGURATION, extensions });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'extensions should contain only strings'
            );
        });

        test('extensions should contain unique entries', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                repositories: ['js', 'ts', 'js', 'md', 'tsx', 'md'],
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'repositories contains duplicate entries: [js, md]'
            );
        });

        test('eslintrc is required', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                eslintrc: undefined as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch('Missing eslintrc');
        });

        test('eslintrc as object is validated', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                eslintrc: { 'not-valid-key': true } as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'eslintrc: ESLint configuration in CLIOptions is invalid'
            );
            expect(validationError).toMatch(
                'Unexpected top-level property "not-valid-key"'
            );
        });

        test('eslintrc as function is validated', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                eslintrc: () => ({ 'not-valid-key': true }) as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'eslintrc: ESLint configuration in CLIOptions is invalid'
            );
            expect(validationError).toMatch(
                'Unexpected top-level property "not-valid-key"'
            );
            expect(validationError).toMatch(
                'Note that "config.eslintrc" is called with empty options during configuration validation.'
            );
        });

        test('rulesUnderTesting requires an array or function', async () => {
            const rulesUnderTesting: any = { length: 10 };
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                rulesUnderTesting,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'rulesUnderTesting should be either an array or function.'
            );
        });

        test('rulesUnderTesting array should contain strings', async () => {
            const rulesUnderTesting: any = [
                'no-undef',
                { value: 'invalid-structure' },
                'testing-library/prefer-wait-for',
            ];
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                rulesUnderTesting,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'rulesUnderTesting should contain only strings'
            );
        });

        test('rulesUnderTesting should contain unique entries', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                rulesUnderTesting: [
                    'no-undef',
                    'react/some-rule',
                    'no-undef',
                    'no-shadow',
                    'prefer-const',
                    'no-shadow',
                ],
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'rulesUnderTesting contains duplicate entries: [no-undef, no-shadow]'
            );
        });

        test.todo('rulesUnderTesting should contain valid ESLint rules');

        test('pathIgnorePattern requires valid pattern', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                pathIgnorePattern: '(forgot-to-close-pattern=.*?',
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'pathIgnorePattern ((forgot-to-close-pattern=.*?) is not valid regex'
            );
            expect(validationError).toMatch('Unterminated group');
        });

        test('maxFileSizeBytes requires number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                maxFileSizeBytes: 'text' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'maxFileSizeBytes (text) should be a number.'
            );
        });

        test('maxFileSizeBytes requires positive number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                maxFileSizeBytes: -123,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'maxFileSizeBytes (-123) should be a positive number.'
            );
        });

        test('CI requires boolean', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                CI: 'text' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch('CI (text) should be a boolean.');
        });

        test('log level requires known value', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                logLevel: 'debug' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'logLevel (debug) is not valid value.'
            );
            expect(validationError).toMatch(
                'Known values are verbose, info, warn, error'
            );
        });

        test('cache requires boolean', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                cache: 'text' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'cache (text) should be a boolean.'
            );
        });

        test('resultParser requires known value', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                resultParser: 'html' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'resultParser (html) is not valid value.'
            );
            expect(validationError).toMatch(
                'Known values are plaintext, markdown'
            );
        });

        test('concurrentTasks requires number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                concurrentTasks: 'text' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'concurrentTasks (text) should be a number.'
            );
        });

        test('concurrentTasks requires positive number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                concurrentTasks: -1,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'concurrentTasks (-1) should be a positive number.'
            );
        });

        test('timeLimit requires number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                timeLimit: 'text' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'timeLimit (text) should be a number.'
            );
        });

        test('timeLimit requires positive number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                timeLimit: -2,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'timeLimit (-2) should be a positive number.'
            );
        });

        test('slowLintTimeLimit requires number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                slowLintTimeLimit: 'text' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'slowLintTimeLimit (text) should be a number.'
            );
        });

        test('slowLintTimeLimit requires positive number', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                slowLintTimeLimit: -2,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'slowLintTimeLimit (-2) should be a positive number.'
            );
        });

        test('compare requires boolean', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                compare: 'text' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'compare (text) should be a boolean.'
            );
        });

        test('updateComparisonReference requires boolean', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                updateComparisonReference: 'text' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'updateComparisonReference (text) should be a boolean.'
            );
        });

        test('onComplete requires function', async () => {
            await validateConfig({
                ...DEFAULT_CONFIGURATION,
                onComplete: 'fetch(api).then(parseResponse)' as any,
            });

            const [validationError] = getConsoleLogCalls();
            expect(validationError).toMatch(
                'onComplete (fetch(api).then(parseResponse)) should be a function'
            );
        });
    });
});

describe('loadTSConfig', () => {
    test('a helpful error is thrown when ts-node is not present', () => {
        jest.mock('ts-node', () => {
            throw new (class extends Error {
                public code;

                constructor(message?: string) {
                    super(message);
                    this.code = 'MODULE_NOT_FOUND';
                }
            })();
        });

        expect(() => loadTSConfig('my-config')).toThrow(
            `'ts-node' is required for TypeScript configuration files.`
        );
    });
});

describe('resolveConfigurationLocation', () => {
    let resolveConfigurationLocation: () => string;
    const mockExistsSync = jest.fn().mockReturnValue(false);
    const mockWriteFileSync = jest.fn();

    beforeAll(() => {
        jest.mock('fs', () => ({
            existsSync: mockExistsSync,
            writeFileSync: mockWriteFileSync,
        }));

        resolveConfigurationLocation =
            require('../../src/config').resolveConfigurationLocation;
    });

    beforeEach(() => {
        mockExistsSync.mockClear();
        mockWriteFileSync.mockClear();
    });

    test('should use value from --config', () => {
        process.argv.push('--config', 'some-config.js');
        const location = resolveConfigurationLocation();
        process.argv.pop();
        process.argv.pop();

        expect(location).toBe('some-config.js');
    });

    test('should return default TypeScript config over JavaScript config', () => {
        mockExistsSync.mockReturnValue(true);

        expect(resolveConfigurationLocation()).toBe(
            'eslint-remote-tester.config.ts'
        );
    });

    test('should return default JavaScript config when TypeScript config does not exist', () => {
        mockExistsSync.mockImplementation(
            filename => filename !== 'eslint-remote-tester.config.ts'
        );

        expect(resolveConfigurationLocation()).toBe(
            'eslint-remote-tester.config.js'
        );
    });
});
