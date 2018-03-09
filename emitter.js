export class Emitter {
    static extend(target) {
        let i, emitter, keys;
        if (target && typeof target === 'object') {
            emitter = new Emitter();
            ['_evt', 'on', 'off', 'once', 'emit', 'triggers']
                .forEach(method => { target[method] = emitter[method]; });
        }
        return target;
    }
    constructor() {
        this._evt = {};
    }
    on(event, listener, context) {
        let listeners, events = this._evt;
        if (event && listener) {
            if (listeners = events[event]) {
                listener._ctx = context;
                this.off(event, listener);
                listeners.push(listener);
            }
            else {
                listeners = [listener];
            }
            events[event] = listeners;
        }
        return this;
    }
    once(event, listener, context) {
        return listener ? this.on(event, function selfRemove() {
            this.off(event, selfRemove);
            listener.apply(context, arguments);
        }) : this;
    }
    off(event, listener) {
        let i, listeners, argNum = arguments.length, events = this._evt;
        if (argNum === 0) {
            this._evt = {};
        }
        else if (argNum === 1) {
            delete events[event];
        }
        else if (argNum === 2) {
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
    emit(event) {
        let i, num, args = arguments, listeners = this._evt[event];
        if (listeners && (num = listeners.length)) {
            listeners = listeners.slice();
            args = args.length > 1
                ? [].slice.call(args, 1)
                : [];
            for (i = 0; i < num; i++)
                listeners[i].apply(this._ctx, args);
        }
        return this;
    }
    triggers(event, listener) {
        let listeners, argsNum = arguments.length, events = this._evt;
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
//# sourceMappingURL=emitter.js.map