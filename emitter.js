export class Emitter {
    static extend(target) {
        return new Emitter(target);
    }
    constructor(target) {
        this._evt = {};
        this._ctx = target || this;
    }
    on(event, listener) {
        let listeners = this._evt[event] || (this._evt[event] = []);
        listeners.push(listener);
        return this;
    }
    once(event, listener) {
        return this.on(event, function selfRemove() {
            this.off(event, selfRemove);
            listener.apply(this, arguments);
        });
    }
    off(event, listener) {
        let n = arguments.length;
        if (n === 0) {
            this._evt = {};
        }
        else if (n === 1) {
            delete this._evt[event];
        }
        else if (n === 1) {
            let listeners = this._evt[event], i = listeners ? listeners.indexOf(listener) : -1;
            if (i > -1)
                listeners.splice(i, 1);
        }
        return this;
    }
    emit(event) {
        let listeners = this._evt[event];
        if (listeners && listeners.length > 0) {
            listeners = listeners.slice();
            let l = listeners.length, args = arguments.length > 1
                ? [].slice.call(arguments, 1)
                : [];
            for (let i = 0; i < l; i++) {
                listeners[i].apply(this._ctx, args);
            }
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