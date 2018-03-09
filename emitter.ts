export class Emitter {

  //private static _n = Object.getOwnPropertyNames

  static extend<T extends object>(target: T): T & Emitter {
    let i, emitter:Emitter, keys;
    if (target && typeof target === 'object') {
      emitter = new Emitter();
      //keys = Emitter._n(Emitter.prototype).concat(Emitter._n(emitter));
      /*keys = ['_evt','_ctx','on','off','once','emit','triggers'];
       for (i = 0; i < 7; i++) {
         (<any>target)[keys[i]] = (<any>emitter)[keys[i]]
       }*/
        ['_evt','on','off','once','emit','triggers']
          .forEach(method => {(<any>target)[method] = (<any>emitter)[method]})
    }
    return <T & Emitter>target
  }

  private _evt: { [key: string]: Function[] }

  constructor() {
    this._evt = {}
  }

  public on(event: string, listener: Function, context?: object) {
    let listeners, events = this._evt;
    if (event && listener) {
      if (listeners = events[event]) {
        // check and remove listener if it is already present
        (<any>listener)._ctx = context
        this.off(event, listener)
        listeners.push(listener)
      } else {
        listeners = <Function[]>[listener]
      }
      events[event] = listeners
    }
    return this
  }

  public once(event: string, listener: Function, context?: object) {
    // TODO: redo this because off would not work with wrappers, and make test fot that
    return listener ? this.on(event, function selfRemove() {
      this.off(event, selfRemove)
      listener.apply(context, arguments)
    }) : this
  }

  public off(event: string, listener: Function) {
    let i, listeners, argNum = arguments.length, events = this._evt
    if (argNum === 0) {
      this._evt = {}
    } else if (argNum === 1) {
      delete events[event]
    } else if (argNum === 2) {
      listeners = events[event]
      i = listeners ? listeners.indexOf(listener) : -1
      if (i > -1) {
        listeners.splice(i, 1)
        if (!listeners.length)
          delete events[event]
      }

    }
    return this;
  }

  public emit(event: string) {
    let i, num, args = arguments,
      listeners = this._evt[event]
    if (listeners && (num = listeners.length)) {
      // get copy in case of mutations
      listeners = listeners.slice()
      // skip slicing arguments if there's 1 or less to speed up
      args = args.length > 1
        ? [].slice.call(args, 1)
        : []
      for (i = 0; i < num; i++)
        listeners[i].apply(this._ctx, args)
    }
    return this
  }

  public triggers(event: string, listener: Function): boolean {
    let listeners, argsNum = arguments.length, events = this._evt
    if (argsNum) {
      if (listeners = events[event]) {
        if (argsNum > 1) {
          return listeners.indexOf(listener) > -1
        } else {
          return true
        }
      } else {
        return false
      }
    } else {
      return !!Object.getOwnPropertyNames(events).length
    }
  }

}
