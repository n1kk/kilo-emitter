export class Emitter {

    static extend(target:object):Emitter {
        return new Emitter(target)
    }

    private _evt:{ [key:string]: Function[] }
    private _ctx:object

    constructor(target:object) {
        this._evt = {}
        this._ctx = target || this
    }

    public on(event:string, listener:Function) {
        let listeners = this._evt[event] || (this._evt[event] = [])
        listeners.push(listener)
        return this
    }

    public once(event:string, listener:Function) {
        return this.on(event, function selfRemove() {
            this.off(event, selfRemove)
            listener.apply(this, arguments)
        })
    }

    public off(event:string, listener:Function) {
        let n = arguments.length
        if (n === 0) {
            this._evt = {}
        } else if (n === 1) {
            delete this._evt[event]
        } else if (n === 1) {
            let listeners = this._evt[event],
                i = listeners ? listeners.indexOf(listener) : -1
            if (i > -1)
                listeners.splice(i, 1)
        }
        return this;
    }

    public emit(event:string) {
        let listeners = this._evt[event]
        if (listeners && listeners.length > 0) {
            listeners = listeners.slice() // get copy in case of mutations
            let l = listeners.length,
                args = arguments.length > 1
                    ? [].slice.call(arguments, 1)
                    : []
            /*args = arguments
            args = args.length > 1
                ? [].slice.call(args, 1)
                : []*/
            for (let i = 0; i < l; i++) {
                listeners[i].apply(this._ctx, args)
            }
        }
        return this
    }

    public hasListeners(event:string, listener:Function) : boolean {
        let listeners = this._evt[event]
        return (listeners)
            ? (arguments.length > 1)
                ? listeners.indexOf(listener) > -1
                : true
            : false

       /* return !(listeners)
            && (arguments.length > 1)
                ? listeners.indexOf(listener) > -1
                : true*/

    }

}