import { useReducer, useLayoutEffect } from 'react';
import { useInput, useApp } from 'ink';

interface ScrollState {
    scrollTop: number;
    isScrollAtBottom: boolean;
    maxScroll: number;
}

type ScrollAction =
    | { type: 'up' }
    | { type: 'down' }
    | { type: 'maxScrollChanged'; maxScroll: number };

const times = (count: number) => (method: () => void) =>
    Array(Math.floor(count))
        .fill(null)
        .forEach(() => method());

function reducer(state: ScrollState, action: ScrollAction) {
    switch (action.type) {
        case 'down': {
            if (state.isScrollAtBottom) return state;

            const scrollTop = state.scrollTop + 1;
            const isScrollAtBottom = scrollTop === state.maxScroll;

            return { ...state, scrollTop, isScrollAtBottom };
        }

        case 'up': {
            if (state.scrollTop === 0) return state;

            const scrollTop = state.scrollTop - 1;

            return { ...state, scrollTop, isScrollAtBottom: false };
        }

        // Update maxScroll and keep scroll synchronized when at bottom
        case 'maxScrollChanged': {
            const maxScroll = Math.max(action.maxScroll, 0);
            const scrollTop =
                state.isScrollAtBottom && maxScroll > 0
                    ? maxScroll
                    : maxScroll === 0
                      ? 0
                      : state.scrollTop;

            return { ...state, maxScroll, scrollTop };
        }

        default:
            return state;
    }
}

/**
 * Generic scroll hook for managing scroll of area
 * - Listens to key events and updates scroll based on given input
 * - Tracks all key events globally
 * - Supports some known unix keymappings of CLI applications
 */
export function useScroll(maxScroll: number, maxHeight: number): number {
    const { exit } = useApp();
    const [{ scrollTop }, dispatch] = useReducer(reducer, {
        scrollTop: 0,
        isScrollAtBottom: true,
        maxScroll: Math.max(maxScroll, 0),
    });

    // Scroll updates called with times() are batched together by React
    useInput((input, key) => {
        if (key.upArrow) {
            return dispatch({ type: 'up' });
        }

        if (key.downArrow) {
            return dispatch({ type: 'down' });
        }

        // Scroll half page down
        if (input === 'd') {
            return times(maxHeight / 2)(() => dispatch({ type: 'down' }));
        }

        // Scroll half page up
        if (input === 'u') {
            return times(maxHeight / 2)(() => dispatch({ type: 'up' }));
        }

        // Scroll to bottom
        if (input === 'G' && key.shift) {
            return times(maxScroll)(() => dispatch({ type: 'down' }));
        }

        // Scroll one page down
        if (input === ' ') {
            return times(maxHeight)(() => dispatch({ type: 'down' }));
        }

        // Exit application and process. Ink handles ctrl+c when useInput
        // is defined and doesn't exit the process itself.
        if (input === 'c' && key.ctrl) {
            exit();
            process.exit();
        }
    });

    useLayoutEffect(() => {
        dispatch({ type: 'maxScrollChanged', maxScroll });
    }, [maxScroll]);

    return scrollTop;
}
