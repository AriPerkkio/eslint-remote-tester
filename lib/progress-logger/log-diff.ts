import { LogUpdate } from './types';

const filterUnique = <T>(item: T, index: number, array: T[]) =>
    array.indexOf(item) === index;

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

    // Go through new log row by row
    for (const [y, row] of newLog.split('\n').entries()) {
        const previousRow = previousRows[y];
        const characters = row.split('');

        // Previous log did not have this row. No need to compare, print it completely
        if (!previousRow) {
            updates.push({ characters: row, wholeRow: true, x: 0, y });
            continue;
        }

        const previousCharacters = previousRow.split('');
        const singleCharacterUpdates: LogUpdate[] = [];

        // Compare single characted changes for current and previous log
        for (const [x, character] of characters.entries()) {
            if (character === previousCharacters[x]) continue;
            singleCharacterUpdates.push({ x, y, characters: character });
        }

        // If all charactes changed, update row as a whole
        if (singleCharacterUpdates.length === characters.length) {
            updates.push({ wholeRow: true, y, x: 0, characters: row });
            continue;
        } else {
            const rowIndexes = singleCharacterUpdates
                .map(u => u.y)
                .filter(filterUnique);

            // Merge characters next to each other into a single update, if any found
            for (const y of rowIndexes) {
                const mergedUpdates: LogUpdate[] = [];
                const rowUpdates = singleCharacterUpdates.filter(
                    u => u.y === y
                );

                for (const update of rowUpdates) {
                    const nextTo = mergedUpdates.find(
                        u => u.x + u.characters.length === update.x
                    );

                    if (nextTo) {
                        nextTo.characters += update.characters;
                    } else {
                        mergedUpdates.push(update);
                    }
                }

                updates.push(...mergedUpdates);
            }
        }

        // If previous row was longer than the new one, fill it remaining characters with whitespace
        if (previousCharacters.length > characters.length) {
            const rightPad = characters.length;

            updates.push({
                x: rightPad,
                y,
                characters: ' '.repeat(previousCharacters.length - rightPad),
            });
        }
    }

    return updates;
}
