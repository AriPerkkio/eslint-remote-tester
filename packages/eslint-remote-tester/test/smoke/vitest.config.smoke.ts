import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: [fileURLToPath(new URL('./*.test.ts', import.meta.url))],
        testTimeout: 300_000,
        fileParallelism: false,
        pool: 'forks',
        setupFiles: [
            fileURLToPath(new URL('./vitest.setup.smoke.ts', import.meta.url)),
        ],
    },
});
