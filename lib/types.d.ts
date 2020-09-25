/**
 * Types shared between modules
 */

import { Linter } from 'eslint';

export interface LintMessage extends Linter.LintMessage {
    path: string;
}
