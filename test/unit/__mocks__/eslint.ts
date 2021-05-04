import * as actual from 'eslint';

type LintResult = actual.ESLint.LintResult;

export class ESLint {
    static mockConstructor = jest.fn();

    constructor(config: unknown) {
        ESLint.mockConstructor(config);
    }

    async lintText(source: string): Promise<LintResult[]> {
        return [
            {
                filePath: './mock/path/file.ts',
                errorCount: 0,
                warningCount: 0,
                fixableErrorCount: 0,
                fixableWarningCount: 0,
                usedDeprecatedRules: [],
                source,
                messages: [
                    {
                        line: 1,
                        column: 0,
                        ruleId: 'mock-rule-id',
                        message: 'mock-message',
                        severity: 2,
                    },
                ],
            },
        ];
    }
}
