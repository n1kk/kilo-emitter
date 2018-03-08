export class Emitter {
    static extend(target) {
        let i, j, keys, emitter = new Emitter(target), bases = [emitter, Emitter.prototype];
        for (j = 0; j < bases.length; j++) {
            keys = Object.getOwnPropertyNames(bases[j] || {});
            for (i = 0; i < keys.length; i++) {
                target[keys[i]] = bases[j][keys[i]];
            }
        }
        return target;
    }
    constructor(target) {
        this._evt = {};
        this._ctx = target || this;
    }
    on(event, listener) {
        if (listener) {
            let i, listeners;
            if (listeners = this._evt[event]) {
                if ((i = listeners.indexOf(listener)) > -1) {
                    listeners.splice(i, 1);
                }
                listeners.push(listener);
            }
            else {
                this._evt[event] = [listener];
            }
        }
        return this;
    }
    once(event, listener) {
        return this.on(event, function selfRemove() {
            this.off(event, selfRemove);
            listener.apply(this, arguments);
        });
    }
    off(event, listener) {
        let i, listeners, n = arguments.length;
        if (n === 0) {
            this._evt = {};
        }
        else if (n === 1) {
            delete this._evt[event];
        }
        else if (n === 2) {
            listeners = this._evt[event];
            i = listeners ? listeners.indexOf(listener) : -1;
            if (i > -1) {
                listeners.splice(i, 1);
            }
        }
        return this;
    }
    emit(event) {
        let i, count, args, listeners = this._evt[event];
        if (listeners && listeners.length > 0) {
            listeners = listeners.slice();
            count = listeners.length;
            args = arguments.length > 1
                ? [].slice.call(arguments, 1)
                : [];
            for (i = 0; i < count; i++)
                listeners[i].apply(this._ctx, args);
        }
        return this;
    }
    hasListeners(event, listener) {
        let listeners = this._evt[event];
        return (listeners)
            ? (arguments.length > 1)
                ? listeners.indexOf(listener) > -1
                : true
            : false;
    }
}
//# sourceMappingURL=emitter.js.map