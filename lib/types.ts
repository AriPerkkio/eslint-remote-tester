/*
 * Typings exported as part of public API
 */

import type { ConfigWithOptionals } from '@config/types';

/**
 * Configuration for `eslint-remote-tester.config.ts`
 */
interface Config extends Omit<ConfigWithOptionals, 'pathIgnorePattern'> {
    /** Regexp pattern string used to exclude paths */
    pathIgnorePattern?: Exclude<
        ConfigWithOptionals['pathIgnorePattern'],
        RegExp
    >;
}

export type { Config };
