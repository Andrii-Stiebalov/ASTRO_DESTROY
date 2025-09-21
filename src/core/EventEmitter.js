export class EventEmitter {
    events = new Map();
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
    }
    off(event, listener) {
        const listeners = this.events.get(event);
        if (!listeners)
            return;
        this.events.set(event, listeners.filter(l => l !== listener));
    }
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (!listeners)
            return;
        for (const l of listeners) {
            l(...args);
        }
    }
}
