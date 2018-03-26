export interface Listener extends Function {
  $ctx ?: object;
  $once ?: boolean;
}

export default class Emitter {

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

  public on(event: string, listener: Listener, context?: object|boolean, priority?:Boolean) : this {
    let listeners, events = this.$evt;
    if (event && listener) {
      if (typeof context == 'boolean') {
        priority = context
        context = null
      } else {
        listener.$ctx = context
      }
      if (listeners = events[event]) {
        // check and remove listener if it is already present
        this.off(event, listener);
        if (priority) {
          listeners.unshift(listener)
        } else {
          listeners.push(listener)
        }
      } else {
        listeners = <Listener[]>[listener]
      }
      events[event] = listeners
    }
    return this
  }

  public once(event: string, listener: Listener, context?: object, priority?:Boolean) : this {
    if (event && listener) {
      listener.$once = true
      this.on(event, listener, context, priority)
    }
    return this
  }

  public off(event?: string, listener?: Function) : this {
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

  public emit(event: string, args?:any[]) : this {
    let i, listener, num,
      listeners = this.$evt[event]
    if (listeners && (num = listeners.length)) {
      // get copy in case of mutations
      listeners = listeners.slice()
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
