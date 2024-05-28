/** @internal */
export const loadTSConfig = async (configPath: string) => {
    let importx: typeof import('importx') | undefined = undefined;
    let jiti: typeof import('jiti') | undefined = undefined;

    try {
        importx = await import('importx');
    } catch {
        try {
            jiti = await import('jiti');
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

    if (jiti) {
        return jiti.default(import.meta.url, {
            interopDefault: true,
            esmResolve: true,
        })(configPath);
    }

    throw new Error(
        "'jiti' or 'importx' is required for loading TypeScript configuration files. Make sure to install one of them."
    );
};

export const loadConfig = async (configPath: string) => {
    if (configPath.endsWith('.ts')) {
        return loadTSConfig(configPath);
    }

    const { default: config } = await import(configPath);
    return config;
};
