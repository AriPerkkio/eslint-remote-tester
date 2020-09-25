import { LogUpdate } from './types';

/**
 * Compares two given strings and construct `LogUpdate` steps of the changes
 * - This gets called during every print; optimization should be considered
 */
export default function diffLogs(
    previousLog: string,
    newLog: string
): LogUpdate[] {
    const updates: LogUpdate[] = [];
    const previousRows = previousLog.split('\n');

    for (const [y, row] of newLog.split('\n').entries()) {
        const previousRow = previousRows[y];
        const characters = row.split('');

        if (!previousRow) {
            for (const [x, character] of characters.entries()) {
                updates.push({ character, x, y });
            }
            continue;
        }

        const previousCharacters = previousRow.split('');
        for (const [x, character] of characters.entries()) {
            if (character === previousCharacters[x]) continue;
            updates.push({ x, y, character });
        }

        if (previousCharacters.length > characters.length) {
            const rightPad = characters.length;

            for (let i = 0; i < previousCharacters.length - rightPad; i++) {
                updates.push({ x: rightPad + i, y, character: ' ' });
            }
        }
    }

    return updates;
}
