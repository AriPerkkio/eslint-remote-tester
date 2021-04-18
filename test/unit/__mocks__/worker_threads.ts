export const isMainThread = true;

type Listener = (...args: any[]) => void;

interface Listeners {
    message: Listener[];
    error: Listener[];
    exit: Listener[];
}

const listeners: Listeners = {
    message: [],
    error: [],
    exit: [],
};

export const Emitter = {
    emit(event: keyof Listeners, data: unknown): void {
        listeners[event].forEach(listener => listener(data));
    },

    clear(): void {
        listeners.message.splice(0);
        listeners.error.splice(0);
        listeners.exit.splice(0);
    },
};

export class Worker {
    on(event: keyof Listeners, listener: Listener): void {
        listeners[event].push(listener);
    }
}
