import { pathToFileURL } from 'node:url';

/** @internal */
export const loadTSConfig = async (configPath: string) => {
    let importx: typeof import('importx') | undefined = undefined;
    let jitiModule:
        | {
              createJiti: typeof import('jiti').createJiti;
              default: typeof import('jiti');
          }
        | undefined = undefined;

    try {
        importx = await import('importx');
    } catch {
        try {
            jitiModule = await import('jiti');
        } catch {
            throw new Error(
                "'jiti' or 'importx' is required for loading TypeScript configuration files. Make sure to install one of them."
            );
        }
    }

    if (importx) {
        const config = await importx.import(configPath, import.meta.url);
        return config.default;
    }

    if (jitiModule) {
        // This is a good indicator that we're using v2+
        if (jitiModule.createJiti) {
            const jiti = jitiModule.createJiti(import.meta.url);
            const config = await jiti.import(configPath, {default: true});
            return config;
        } else {
            // We're using jiti v1 here.
            return jitiModule.default(import.meta.url, {
                interopDefault: true,
                // @ts-expect-error - jiti v1 option
                esmResolve: true,
            })(configPath);
        }
    }

    throw new Error(
        "'jiti' or 'importx' is required for loading TypeScript configuration files. Make sure to install one of them."
    );
};

export const loadConfig = async (configPath: string) => {
    if (configPath.endsWith('.ts')) {
        return loadTSConfig(configPath);
    }

    const { default: config } = await import(pathToFileURL(configPath).href);
    return config;
};
