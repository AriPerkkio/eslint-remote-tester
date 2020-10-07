import chalk, { Chalk } from 'chalk';
import readline from 'readline';

import logger from './progress-logger';
import diffLogs from './log-diff';
import * as Templates from './log-templates';
import config from '../config';

const REFRESH_INTERVAL_MS = 200;
const DEFAULT_COLOR_METHOD = (c: string) => c;

// Status row + empty line between tasks and messages
const CONTENT_PADDING = 2;

class LogRenderer {
    /** Handle of refresh interval */
    intervalHandle: NodeJS.Timeout | null = null;

    /** Contents of previous log. Used to diff new contents */
    previousLog = '';

    /** Colors of previous log */
    previousColors: (Chalk | null | undefined)[] = [];

    /** Indicates how many rows have been scrolled from top */
    scrollTop = 0;

    constructor() {
        logger.on('exit', () => this.stop());
        logger.on('message', () => {
            if (config.CI) {
                this.printCI();
            } else {
                this.synchronizeScroll();
            }
        });

        readline.emitKeypressEvents(process.stdin);
        process.stdout.on('resize', () => this.handleResize());
        process.stdin.on('keypress', (_, key) => this.handleKeyPress(key));
        process.stdin.setRawMode(true);

        this.start();
    }

    /**
     * Initialize/reset previous printing values and start printing on interval
     */
    start() {
        // On CI messages are printed by listening message event, not on interval
        if (config.CI) return;

        this.previousLog = '';
        this.previousColors = [];
        this.scrollTop = 0;

        console.clear();
        this.intervalHandle = setInterval(() => {
            this.printCLI();
        }, REFRESH_INTERVAL_MS);
    }

    /**
     * Stop printing interval
     * - Move scroll to bottom and perform one final print
     */
    stop(stoppedByUser?: boolean) {
        if (this.intervalHandle !== null) {
            clearTimeout(this.intervalHandle);
        }

        if (!config.CI) {
            const overflowingCount = this.getOverflowingMessageCount();

            if (overflowingCount > 0) {
                this.scrollTop += overflowingCount + 1;
            }
            this.printCLI();
        }
        process.stdin.pause();

        // Reset cursor and exit
        process.stdout.cursorTo(0, this.getContentHeight());

        // CI should not stop, unless this was a stop event from user input
        // This will also terminate all the currently running workers
        if (stoppedByUser || !config.CI) {
            process.exit();
        }
    }

    /**
     * Handle key down events
     */
    handleKeyPress(key: any) {
        const { name, ctrl } = key || {};

        switch (name) {
            case 'c':
                return ctrl && this.stop(true);
            case 'down':
                return this.scrollDown();
            case 'up':
                return this.scrollUp();
        }
    }

    /**
     * Handle terminal resize events
     * - On terminal size change full print is required
     */
    handleResize() {
        if (this.intervalHandle !== null) {
            // This will stop current printing immediately
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;

            // Reset printing status and start over in order to recover from terminal size change
            this.start();
        }
    }

    /**
     * Move scroll down, if possible
     */
    scrollDown() {
        if (this.getOverflowingMessageCount() >= 0) {
            this.scrollTop++;
        }
    }

    /**
     * Scroll up, if possible
     */
    scrollUp() {
        if (this.scrollTop > 0) {
            this.scrollTop--;
        }
    }

    /**
     * Synchronize scroll with latest message count when scroll is at bottom
     */
    synchronizeScroll() {
        const isScrollAtBottom =
            logger.messages.length - this.getMaxMessageCount() ===
            this.scrollTop;

        if (isScrollAtBottom) {
            this.scrollDown();
        }
    }

    /**
     * Calculate how many rows are needed for the content
     */
    getContentHeight() {
        const { tasks, messages } = logger;
        const terminalHeight = process.stdout.rows;
        const wholeContent = messages.length + tasks.length + CONTENT_PADDING;

        return terminalHeight <= wholeContent ? terminalHeight : wholeContent;
    }

    /**
     * Calculate how many messages screen currently fits
     */
    getMaxMessageCount() {
        const terminalHeight = process.stdout.rows;

        return terminalHeight - logger.tasks.length - CONTENT_PADDING;
    }

    /**
     * Calculate how many messages are hidden below screen
     */
    getOverflowingMessageCount() {
        const { messages } = logger;
        const maxMessageCount = this.getMaxMessageCount();
        const count = messages.length - maxMessageCount - this.scrollTop;

        return count > 0 ? count : 0;
    }

    /**
     * Printing method for CLI mode
     * - Updates terminal with status of tasks and adds new messages
     */
    printCLI() {
        const { messages, tasks, scannedRepositories } = logger;
        const terminalHeight = process.stdout.rows;
        const terminalWidth = process.stdout.columns;

        // Render only the amount of messages the screen can fit
        // Pick messages based on scroll position
        const messageRows = messages.slice(
            this.scrollTop,
            this.scrollTop + this.getMaxMessageCount()
        );

        // Add scroll indicator to top displaying amount of hidden messages
        if (this.scrollTop) {
            messageRows.splice(0, 1, {
                content: Templates.OVERFLOWING_ROWS_TOP(this.scrollTop),
                color: chalk.yellow,
            });
        }

        // Add scroll indicator to bottom displaying amount of hidden messages
        const overflowingMessages = this.getOverflowingMessageCount();
        if (overflowingMessages > 0) {
            messageRows.splice(-1, 1, {
                content: Templates.OVERFLOWING_ROWS_BOTTOM(overflowingMessages),
                color: chalk.yellow,
            });
        }

        const rows = [
            Templates.REPOSITORIES_STATUS_TEMPLATE(scannedRepositories),
            ...tasks.map(Templates.TASK_TEMPLATE),
            ' ', // Line break between tasks and messages
            ...messageRows.map(message => message.content),
        ].map(row => {
            // Prevent row wrapping
            if (row.length > terminalWidth) {
                return `${row.slice(0, terminalWidth - 3)}...`;
            }

            return row;
        });

        const colors = [
            null, // Status row
            ...tasks.map(task => task.color),
            null, // Line break
            ...messageRows.map(message => message.color),
        ];

        // Update colors of whole row
        for (const [rowIndex, color] of colors.entries()) {
            if (this.previousColors[rowIndex] !== color) {
                const row = rows[rowIndex];
                const colorMethod = color || DEFAULT_COLOR_METHOD;

                process.stdout.cursorTo(0, rowIndex);
                process.stdout.clearLine(0);
                process.stdout.write(colorMethod(row));
            }
        }

        const formattedLog = rows.join('\n');
        const updates = diffLogs(this.previousLog, formattedLog);

        // Update characters changes, e.g. step or file count changes
        for (const { x, y, characters, wholeRow } of updates) {
            const colorMethod = colors[y] || DEFAULT_COLOR_METHOD;

            // These were already updated by row's color update
            if (this.previousColors[y] !== colors[y]) continue;

            process.stdout.cursorTo(x, y);
            wholeRow && process.stdout.clearLine(0);
            process.stdout.write(colorMethod(characters));
        }

        // Keep cursor on last row at the first or last column
        process.stdout.cursorTo(
            terminalHeight <= this.getContentHeight() ? terminalWidth : 0,
            rows.length + 1
        );

        this.previousColors = colors;
        this.previousLog = formattedLog;
    }

    /**
     * Printing method for CI mode
     * - Prints only the latest message
     */
    printCI() {
        const lastMessage = [...logger.messages].pop();

        if (lastMessage) {
            const color = lastMessage.color || DEFAULT_COLOR_METHOD;
            console.log(color(lastMessage.content));
        }
    }
}

export default new LogRenderer();
