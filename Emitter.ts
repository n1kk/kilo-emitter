/**
 * Interface of listener callback that is subscribed to an event.
 */
export interface Listener extends Function {
  /**
   * Holds a reference to the context object that is passed in `.on()` or `.once()` methods.
   */
  $ctx ?: object;
  /**
   * Boolean flag to indicate that listener should be removed after invocation.
   */
  $once ?: boolean;
}

/**
 * Event Emitter class that takes care of managing subscribed listeners and dispatching events to them.
 */
export default class Emitter {

  /**
   * Extends target object that is passed to it with Emitter class methods. It creates new Emitter class and assigns all of it's fields and methods (including $evt) to target object. Note that those methods will override existing fields with same names and also should now be invoked on target since they rely on `this` keyword.
   * @param target  An object that will be extended.
   * @returns       Extended target object
   *
   * @example
   * ```typescript
   * let someObject = {someField: 'someValue'}
   * Emitter.extend(someObject)
   *
   * someObject.on('evt', function (someParam) {
   *   console.log(someParam) // 'otherValue'
   *   console.log(this.someField) // 'someValue'
   * })
   * someObject.emit('evt', ['otherValue'])
   * ```
   */
  static extend<T extends object>(target: T): T & Emitter {
    let i, emitter:Emitter, keys;
    if (target && typeof target === 'object') {
      emitter = new Emitter();
      ['$evt','on','off','once','emit','triggers']
        .forEach((method: keyof Emitter) => { (<any>target)[method] = emitter[method] })
    }
    return <T & Emitter>target
  }

  /**
   * Internal field that is used to store info about events and listeners
   */
  private $evt: { [key: string]: Listener[] }

  /**
   * Instantiates Emitter class, creates empty $evt field.
   */
  constructor() {
    this.$evt = {}
  }

  /**
   * Subscribes a listener to an event. Listener will persist until removed with .off(). Subscribing an existing listener again will move it to the end (or start, if priority specified) of the queue. Unique listener is considered a combo of an event name and a reference to a function. If a same callback added with a different context it will be considered as a same listener.
   * @param event     Event name you want to subscribe to.
   * @param listener  Listener callback to be invoked.
   * @param context   Context to invoke callback with (pass as this) OR a boolean value for priority if you want to skip context
   * @param priority  If true will add listener to the start of the queue.
   * @returns       Emitter instance for chaining
   *
   * @example
   * ```typescript
   * let em = new Emitter()
   *
   * // regulat listener
   * someObject.on('evt', () => {})
   *
   * // listener with context
   * someObject.on('evt', () => {}, {someField: 'someValue'})
   *
   * // listener with priority (added to the start of queue)
   * someObject.on('evt', () => {}, null, true)
   * // same
   * someObject.on('evt', () => {}, true)
   *
   * someObject.emit('evt', ['otherValue'])
   * ```
   */
  public on(event: string, listener: Listener, context?: object|boolean, priority?:Boolean) {
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

  /**
   * Same as `.on()` but listener will be automatically removed after first invocation.
   * @param event     Event name you want to subscribe to.
   * @param listener  Listener callback to be invoked.
   * @param context   Context to invoke callback with (pass as this).
   * @param priority  If true will add listener to the start of the queue.
   * @returns       Emitter instance for chaining
   */
  public once(event: string, listener: Listener, context?: object, priority?:Boolean) {
    if (event && listener) {
      listener.$once = true
      this.on(event, listener, context, priority)
    }
    return this
  }

  /**
   * If both arguments are passed it removes the listener if such exists. If only event name is passed it will remove all the listeners for that event. If no arguments passed it will purge all the listeners for current emitter. Distinction is made by the length of the `arguments` variable to avoid undesired behaviour when `null` or `undefined` are passed due to an error. This means that `off('init')` will try to remove all listeners for _'init'_ event and `off(null)` will try to remove all events for  _'null'_ event.
   * @param event     Event name you want to unsubscribe from.
   * @param listener  Listener callback you want to remove.
   * @returns       Emitter instance for chaining
   */
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

  /**
   * Emits an event invoking all the listeners subscribed to it and passing rest of the arguments to them. Listeners array is cloned to prevent errors due to array mutation while event is still being emitted. If listener returns a string 'stopEmit' then the process will be aborted and rest of the listeners in queue will not be invoked, if some of then were added as .once() then it means that they will not be removed and will remain in queue until invoked or removed explicitly.
   * @param event   Event name whose listeners should be invoked.
   * @param args    Array of arguments that should be passed to each listener callback.
   * @returns       Emitter instance for chaining
   */
  public emit(event: string, args?:any[]) {
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

  /**
   * If both arguments are passed then it will check whether specific listener is subscribed for specific event. If only event name is passed it will check if there are any listeners subscribed for that event. If no arguments passed it will check if emitter has any listeners at all. Distinction is made by the length of the `arguments` variable to avoid undesired behaviour when `null` or `undefined` are passed due to an error. This means that `triggers('init')` will check if there are any listeners fot the event _'init'_ and `triggers(null)` will check if there are any listeners fot the event  _'null'_.
   * @param event     Event name.
   * @param listener  Listener function.
   * @returns       Boolean value determining whether check succeeded or not.
   */
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
