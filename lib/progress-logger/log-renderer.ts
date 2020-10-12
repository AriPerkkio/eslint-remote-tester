import chalk, { Chalk } from 'chalk';
import readline from 'readline';

import logger from './progress-logger';
import diffLogs from './log-diff';
import * as Templates from './log-templates';
import config from '../config';
import { getResults } from '../file-client';

const REFRESH_INTERVAL_MS = 200;
const KEY_DOWN_TIMER_MS = 200;
const DEFAULT_COLOR_METHOD = (c: string) => c;

const times = (count: number) => (method: () => void) =>
    Array(Math.floor(count))
        .fill(null)
        .forEach(() => method());

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

    /** Used to prevent flooding key down events when key is held down */
    isKeyPressed = false;

    constructor() {
        if (config.CI) {
            logger.on('message', () => this.printCI());
            logger.on('exit', () => this.stopCI());
        } else {
            const isCliAvailable =
                process.stdout.isTTY &&
                process.stdin.setRawMode &&
                process.stdout.cursorTo;

            if (!isCliAvailable) {
                console.log(chalk.red(Templates.CLI_MODE_NOT_TTY));
                process.exit();
            }

            logger.on('message', () => this.synchronizeScroll());
            logger.on('exit', () => this.stopCLI());

            readline.emitKeypressEvents(process.stdin);
            process.stdout.on('resize', () => this.handleResize());
            process.stdin.on('keypress', (_, key) => this.handleKeyPress(key));
            process.stdin.setRawMode(true);

            this.startCLI();
        }
    }

    /**
     * Initialize/reset previous printing values and start printing on interval
     */
    startCLI() {
        this.previousLog = '';
        this.previousColors = [];

        console.clear();
        this.intervalHandle = setInterval(() => {
            this.printCLI();
        }, REFRESH_INTERVAL_MS);
    }

    /**
     * Stop CLI's printing interval
     * - Move scroll to bottom and perform one final print
     */
    stopCLI() {
        if (this.intervalHandle !== null) {
            clearTimeout(this.intervalHandle);
        }

        const messages = logger.messages.map(message => {
            const color = message.color || DEFAULT_COLOR_METHOD;

            return color(message.content);
        });

        // Print all messages to console for unlocked scroll
        const formattedLog = ['Full log:', ...messages].join('\n');

        console.clear();
        process.stdout.cursorTo(0, 0);
        console.log(formattedLog);

        process.stdin.pause();
        process.exit();
    }

    /**
     * Stop CI's printing
     */
    stopCI() {
        const results = getResults();

        const formattedResults =
            results.length > 0 ? results.join('\n') : 'No errors';

        console.log(formattedResults);
        process.exit();
    }

    /**
     * Handle key down events
     * - Waits `KEY_DOWN_TIMER_MS` until next key press is accepted
     */
    handleKeyPress(key: any) {
        if (this.isKeyPressed) return;
        this.isKeyPressed = true;

        setTimeout(() => {
            this.isKeyPressed = false;
        }, KEY_DOWN_TIMER_MS);

        const { name, ctrl, shift } = key || {};

        switch (name) {
            case 'c':
                return ctrl && this.stopCLI();
            case 'l':
                return ctrl && this.startCLI();
            case 'g':
                return shift && this.scrollToBottom();
            case 'd':
                return this.scrollHalfPageDown();
            case 'u':
                return this.scrollHalfPageUp();
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
            this.startCLI();
        }
    }

    /**
     * Move scroll down, if possible
     */
    scrollDown() {
        if (this.getOverflowingMessageCount() > 0) {
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
     * Move scroll to bottom
     */
    scrollToBottom() {
        const overflowingCount = this.getOverflowingMessageCount();
        const padding = logger.tasks.length === 0 ? 1 : 0;

        if (overflowingCount > 0) {
            this.scrollTop += overflowingCount + padding;
        }
    }

    /**
     * Scroll half a page down
     */
    scrollHalfPageDown() {
        times(this.getContentHeight() / 2)(() => this.scrollDown());
    }

    /**
     * Scroll half a page down
     */
    scrollHalfPageUp() {
        times(this.getContentHeight() / 2)(() => this.scrollUp());
    }

    /**
     * Synchronize scroll with latest message count when scroll is at bottom
     */
    synchronizeScroll() {
        const newScrollTop = this.scrollTop + 1;

        // Increase scroll if it's already at the bottom
        const isScrollAtBottom =
            logger.messages.length - this.getMaxMessageCount() === newScrollTop;

        // Prevent scrolling too much when content is reducing due to tasks running out
        const tasksReducing =
            config.concurrentTasks >
            config.repositories.length - logger.scannedRepositories;

        if (isScrollAtBottom && !tasksReducing) {
            this.scrollTop = newScrollTop;
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

        return terminalHeight - this.getTaskCount() - CONTENT_PADDING;
    }

    /**
     * Calculate how many rows should be dedicated to tasks
     */
    getTaskCount() {
        const tasksReducing =
            config.concurrentTasks >
            config.repositories.length - logger.scannedRepositories;

        return tasksReducing ? logger.tasks.length : config.concurrentTasks;
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

        // Prevent blinking screen when task count changes between prints
        const tasksPadding = this.getTaskCount() - tasks.length;

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
                color: chalk.yellow.bold,
            });
        }

        // Add scroll indicator to bottom displaying amount of hidden messages
        const overflowingMessages = this.getOverflowingMessageCount();
        if (overflowingMessages > 0) {
            messageRows.splice(-1, 1, {
                content: Templates.OVERFLOWING_ROWS_BOTTOM(overflowingMessages),
                color: chalk.yellow.bold,
            });
        }

        const rows = [
            Templates.REPOSITORIES_STATUS_TEMPLATE(scannedRepositories),
            ...tasks.map(Templates.TASK_TEMPLATE),
            ...Array(tasksPadding).fill(' '),
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
            ...Array(tasksPadding).fill(DEFAULT_COLOR_METHOD),
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
