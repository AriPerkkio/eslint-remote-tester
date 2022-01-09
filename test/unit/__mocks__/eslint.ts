import * as actual from 'eslint';

type LintResult = actual.ESLint.LintResult;

export class ESLint {
    static mockConstructor = jest.fn();

    constructor(config: unknown) {
        ESLint.mockConstructor(config);
    }

    async lintFiles(filePath: string): Promise<LintResult[]> {
        return [
            {
                filePath,
                errorCount: 0,
                warningCount: 0,
                fixableErrorCount: 0,
                fixableWarningCount: 0,
                fatalErrorCount: 0,
                usedDeprecatedRules: [],
                source: '/'.repeat(2000),
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
