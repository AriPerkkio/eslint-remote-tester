import fs from 'node:fs';

export function removeDirectorySync(dir: string): void {
    // Available in Node 16
    if (fs.rmSync != null && typeof fs.rmSync === 'function') {
        return fs.rmSync(dir, { recursive: true });
    }

    // Fallback to older Node versions
    return fs.rmdirSync(dir, { recursive: true });
}
