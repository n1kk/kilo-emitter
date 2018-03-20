export default class Emitter {
    static extend(target) {
        let i, emitter, keys;
        if (target && typeof target === 'object') {
            emitter = new Emitter();
            ['$evt', 'on', 'off', 'once', 'emit', 'triggers']
                .forEach((method) => { target[method] = emitter[method]; });
        }
        return target;
    }
    constructor() {
        this.$evt = {};
    }
    on(event, listener, context, priority) {
        let listeners, events = this.$evt;
        if (event && listener) {
            listener.$ctx = context;
            if (listeners = events[event]) {
                this.off(event, listener);
                if (priority)
                    listeners.unshift(listener);
                else
                    listeners.push(listener);
            }
            else {
                listeners = [listener];
            }
            events[event] = listeners;
        }
        return this;
    }
    once(event, listener, context, priority) {
        if (event && listener) {
            listener.$once = true;
            this.on(event, listener, context, priority);
        }
        return this;
    }
    off(event, listener) {
        let i, listeners, argNum = arguments.length, events = this.$evt;
        if (argNum === 0) {
            this.$evt = {};
        }
        else if (argNum === 1) {
            delete events[event];
        }
        else {
            listeners = events[event];
            i = listeners ? listeners.indexOf(listener) : -1;
            if (i > -1) {
                listeners.splice(i, 1);
                if (!listeners.length)
                    delete events[event];
            }
        }
        return this;
    }
    emit(event, ...args) {
        let i, result, listener, num, listeners = this.$evt[event];
        if (listeners && (num = listeners.length)) {
            listeners = listeners.slice();
            for (i = 0; i < num; i++) {
                listener = listeners[i];
                result = listener.apply(listener.$ctx, args);
                if (listener.$once) {
                    this.off(event, listener);
                    delete listener.$once;
                }
                if (result === false) {
                    break;
                }
            }
        }
        return this;
    }
    triggers(event, listener) {
        let listeners, argsNum = arguments.length, events = this.$evt;
        if (argsNum) {
            if (listeners = events[event]) {
                if (argsNum > 1) {
                    return listeners.indexOf(listener) > -1;
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        }
        else {
            return !!Object.getOwnPropertyNames(events).length;
        }
    }
}

//# sourceMappingURL=emitter.es6.js.map
