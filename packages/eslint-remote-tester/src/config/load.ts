import { createRequire } from 'node:module';
import type { Service, RegisterOptions } from 'ts-node';

let registerer: Service | null = null;
const require = createRequire(import.meta.url);

/* istanbul ignore next */
const interopRequireDefault = (obj: any): { default: any } =>
    obj && obj.__esModule ? obj : { default: obj };

/** @internal */
export const loadTSConfig = (configPath: string) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        registerer ||= require('ts-node').register({
            moduleTypes: { '**/*.ts': 'cjs' },
        } satisfies RegisterOptions) as Service;
    } catch (e: any) {
        if (e.code === 'MODULE_NOT_FOUND') {
            throw new Error(
                `'ts-node' is required for TypeScript configuration files. Make sure it is installed\nError: ${e.message}`
            );
        }

        throw e;
    }

    registerer.enabled(true);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const configObject = interopRequireDefault(require(configPath)).default;

    registerer.enabled(false);

    return configObject;
};

export const loadConfig = (configPath: string) => {
    if (configPath.endsWith('.ts')) {
        return loadTSConfig(configPath);
    }

    return require(configPath);
};
