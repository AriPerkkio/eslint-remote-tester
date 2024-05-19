import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: [fileURLToPath(new URL('./*.test.ts', import.meta.url))],
        testTimeout: 15_000,
        fileParallelism: false,
        pool: 'forks',
        setupFiles: [
            fileURLToPath(
                new URL('./vitest.setup.integration.ts', import.meta.url)
            ),
        ],
    },
});
