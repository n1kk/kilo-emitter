export class Emitter {

  static extend<T extends object>(target: T): T & Emitter {
    let i, j, keys, emitter = new Emitter(target),
      bases = [emitter, Emitter.prototype]
    for (j = 0; j < bases.length; j++) {
      keys = Object.getOwnPropertyNames(bases[j]||{});
      for (i = 0; i < keys.length; i++) {
        (<any>target)[keys[i]] = (<any>bases[j])[keys[i]]
      }
    }
    return <T & Emitter>target
  }

  private _evt: { [key: string]: Function[] }
  private _ctx: object

  constructor(target: object) {
    this._evt = {}
    this._ctx = target || this
  }

  public on(event: string, listener: Function) {
    /*let i, listeners = this._evt[event] || (this._evt[event] = <Function[]>[])

    if ((i = listeners.indexOf(listener)) > -1)
      listeners.splice(i, 1)
    listeners.push(listener)*/
    if (listener) {
      let i, listeners
      if (listeners = this._evt[event]) {
        // check if listener already exists, doing manually instead of .off() for performance
        if ((i = listeners.indexOf(listener)) > -1) {
          listeners.splice(i, 1)
        }
        listeners.push(listener)
      } else {
        this._evt[event] = <Function[]>[listener]
      }
    }
    return this
  }

  public once(event: string, listener: Function) {
    return this.on(event, function selfRemove() {
      this.off(event, selfRemove)
      listener.apply(this, arguments)
    })
  }

  public off(event: string, listener: Function) {
    let i, listeners, n = arguments.length
    if (n === 0) {
      this._evt = {}
    } else if (n === 1) {
      delete this._evt[event]
    } else if (n === 2) {
      listeners = this._evt[event]
      i = listeners ? listeners.indexOf(listener) : -1
      if (i > -1) {
        listeners.splice(i, 1)
      }
    }
    return this;
  }

  public emit(event: string) {
    let i, count, args, listeners = this._evt[event]
    if (listeners && listeners.length > 0) {
      // get copy in case of mutations
      listeners = listeners.slice()
      count = listeners.length
      // skip slicing arguments if there's 1 or less to speed up
      args = arguments.length > 1
        ? [].slice.call(arguments, 1)
        : []
      for (i = 0; i < count; i++)
        listeners[i].apply(this._ctx, args)
    }
    return this
  }

  public hasListeners(event: string, listener: Function): boolean {
    let listeners = this._evt[event]
    return (listeners)
      ? (arguments.length > 1)
        ? listeners.indexOf(listener) > -1
        : true
      : false
  }

}
