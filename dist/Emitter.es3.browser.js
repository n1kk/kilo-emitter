window.Emitter = (function () {
    function Emitter() {
        this.$evt = {};
    }
    Emitter.extend = function (target) {
        var i, emitter, keys;
        if (target && typeof target === 'object') {
            emitter = new Emitter();
            ['$evt', 'on', 'off', 'once', 'emit', 'triggers']
                .forEach(function (method) { target[method] = emitter[method]; });
        }
        return target;
    };
    Emitter.prototype.on = function (event, listener, context, priority) {
        var listeners, events = this.$evt;
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
    };
    Emitter.prototype.once = function (event, listener, context, priority) {
        if (event && listener) {
            listener.$once = true;
            this.on(event, listener, context, priority);
        }
        return this;
    };
    Emitter.prototype.off = function (event, listener) {
        var i, listeners, argNum = arguments.length, events = this.$evt;
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
    };
    Emitter.prototype.emit = function (event) {
        var i, listener, num, args = arguments, listeners = this.$evt[event];
        if (listeners && (num = listeners.length)) {
            listeners = listeners.slice();
            args = args.length > 1
                ? [].slice.call(args, 1)
                : [];
            for (i = 0; i < num; i++) {
                listener = listeners[i];
                if (listener.apply(listener.$ctx, args) === "stopEmit")
                    i = num;
                if (listener.$once) {
                    this.off(event, listener);
                    delete listener.$once;
                }
            }
        }
        return this;
    };
    Emitter.prototype.triggers = function (event, listener) {
        var listeners, argsNum = arguments.length, events = this.$evt;
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
    };
    return Emitter;
}());

//# sourceMappingURL=Emitter.es3.browser.js.map
