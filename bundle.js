var Emitter = (function (exports) {
'use strict';

var Emitter = (function () {
    function Emitter(target) {
        this._evt = {};
        this._ctx = target || this;
    }
    Emitter.extend = function (target) {
        return new Emitter(target);
    };
    Emitter.prototype.on = function (event, listener) {
        var listeners = this._evt[event] || (this._evt[event] = []);
        listeners.push(listener);
        return this;
    };
    Emitter.prototype.once = function (event, listener) {
        return this.on(event, function selfRemove() {
            this.off(event, selfRemove);
            listener.apply(this, arguments);
        });
    };
    Emitter.prototype.off = function (event, listener) {
        if (arguments.length === 0) {
            this._evt = {};
        }
        else if (arguments.length === 1) {
            delete this._evt[event];
        }
        else if (arguments.length === 1) {
            var listeners = this._evt[event], i = listeners ? listeners.indexOf(listener) : -1;
            if (i > -1)
                listeners.splice(i, 1);
        }
        return this;
    };
    Emitter.prototype.emit = function (event) {
        var listeners = this._evt[event];
        if (listeners && listeners.length > 0) {
            listeners = listeners.slice();
            var l = listeners.length, args = arguments.length > 1
                ? Array.prototype.slice.call(arguments, 1)
                : [];
            for (var i = 0; i < l; i++) {
                listeners[i].apply(this._ctx, args);
            }
        }
        return this;
    };
    Emitter.prototype.triggers = function (event, listener) {
        var listeners = this._evt[event];
        return (listeners)
            ? (arguments.length > 1)
                ? listeners.indexOf(listener) > -1
                : true
            : false;
    };
    return Emitter;
}());

exports.Emitter = Emitter;

return exports;

}({}));
