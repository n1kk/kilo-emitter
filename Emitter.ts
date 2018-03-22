export interface Listener extends Function {
  $ctx ?: object;
  $once ?: boolean;
}


export default class Emitter {

  //private static _n = Object.getOwnPropertyNames

  static extend<T extends object>(target: T): T & Emitter {
    let i, emitter:Emitter, keys;
    if (target && typeof target === 'object') {
      emitter = new Emitter();
      ['$evt','on','off','once','emit','triggers']
        .forEach((method: keyof Emitter) => { (<any>target)[method] = emitter[method] })
    }
    return <T & Emitter>target
  }

  private $evt: { [key: string]: Listener[] }

  constructor() {
    this.$evt = {}
  }

  public on(event: string, listener: Listener, context?: object, priority?:Boolean) {
    let listeners, events = this.$evt;
    if (event && listener) {
      listener.$ctx = context
      if (listeners = events[event]) {
        // check and remove listener if it is already present
        this.off(event, listener);
        //listeners[priority ? 'push' : 'unshift'](listener)
        //(priority ? listeners.push : listeners.unshift)(listener)
        if (priority)
          listeners.unshift(listener)
        else
          listeners.push(listener)
      } else {
        listeners = <Listener[]>[listener]
      }
      events[event] = listeners
    }
    return this
  }

  public once(event: string, listener: Listener, context?: object, priority?:Boolean) {
    if (event && listener) {
      listener.$once = true
      this.on(event, listener, context, priority)
    }
    return this
  }

  public off(event?: string, listener?: Function) {
    let i, listeners, argNum = arguments.length, events = this.$evt
    if (argNum === 0) {
      this.$evt = {}
    } else if (argNum === 1) {
      delete events[event]
    } else {
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

  // for browser build ...args will be replaced with [].slice.call(arguments) for a smaller footprint
  public emit(event: string /* IF NOT BROWSER */, ...args:any[] /**/) {
    let i, listener, num,
      /* IF BROWSER
      args = arguments,
      /**/
      listeners = this.$evt[event]
    if (listeners && (num = listeners.length)) {
      // get copy in case of mutations
      listeners = listeners.slice()
      // skip slicing arguments if there's 1 or less to speed up
      /* IF BROWSER
      args = args.length > 1
        ? [].slice.call(args, 1)
        : []
      /**/
      for (i = 0; i < num; i++) {
        listener = listeners[i]
        // if listener returns "stopEmit" then do not invoke any other listeners
        if (listener.apply(listener.$ctx, args) === "stopEmit")
          i = num
        if (listener.$once) {
          this.off(event, listener)
          delete listener.$once
        }
      }
    }
    return this
  }

  public triggers(event?: string, listener?: Function): boolean {
    let listeners, argsNum = arguments.length, events = this.$evt
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
