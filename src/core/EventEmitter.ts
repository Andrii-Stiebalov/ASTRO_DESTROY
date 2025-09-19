// core/EventEmitter.ts
type Listener = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  off(event: string, listener: Listener) {
    const listeners = this.events.get(event);
    if (!listeners) return;
    this.events.set(event, listeners.filter(l => l !== listener));
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event);
    if (!listeners) return;
    for (const l of listeners) {
      l(...args);
    }
  }
}
