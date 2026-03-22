/**
 * AI Academy - Event Bus
 * Lightweight pub/sub for decoupled subsystem communication
 */

class EventBus {
    constructor() {
        this._listeners = {};
    }

    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this._listeners[event]) return;
        for (const callback of this._listeners[event]) {
            try {
                callback(data);
            } catch (error) {
                console.error(`EventBus error in '${event}':`, error);
            }
        }
    }
}

window.EventBus = EventBus;
export { EventBus };
