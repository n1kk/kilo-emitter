## What & Why
A sub 1Kb event emitter class with broader functionality.

Why another one ?

I needed some specific but not unheard of features of event emitter and all the lightweight implementations I founds were all missing one or the other, so I ended up making my own with set of features that I needed. It's not better or worse than other ones, it just combines a specific set.
 
So here's what I needed from event emitter and ended up implementing in this one:
* Small footprint, 1Kb or less.
* Chainalbe methods.
* Instantiate with `new` as well as extend existing object.
* Reliable listener removal (usually `once` were implemented as wrappers so you couldn't remove them by same listener reference).
* Ability to remove all listeners for given event. See [`.off(event)`](#offevent-listener)
* Ability to remove all listeners for all events. See [`.off(event)`](#offevent-listener)
* Priority listeners (added to the start of the queue instead of end). See [`.on()`](#onevent-listener-context-priority)
* Ability to pass context to the listener as this keyword. See [`.on()`](#onevent-listener-context-priority)
* Ability to stop propagation of current event, smth like `preventDefaults`. See [`.emit()`](#emitevent-args)
* Ability to pass arguments together with event. See [`.emit()`](#emitevent-args)
* Ability to check whether specific listener is subscribed for a specific event. See [`.triggers()`](#triggersevent-listener)
* Ability to check whether emitter has any listeners subscribed for specified event or any listeners at all. See [`.triggers()`](#triggersevent-listener)
* Available under diferent formats (ES3, ES5, ES6, Browser, inlined)

## Stats
#### Coverage
 
${CoverageTable}

#### `dist` directory size listing

${CompiledSizeTable}

## Usage
##### Package manager
```bash
npm i ${PackageName}
```
```bash
yarn add ${PackageName}
```
##### Browser tag
```html
<script src="https://unpkg.com/${PackageName}/${PackageBrowserFile}"></script>
```
##### Inlined
Or you can just grab this compiled inlined version and copy-paste it in your code.

ES3, __${InlineES3CompiledSize}__ Bytes
```javascript
${InlineES3CompiledCode}
```
ES6, __${InlineES6CompiledSize}__ Bytes
```typescript
${InlineES6CompiledCode}
```

##### Node
```javascript
const Emitter = require('${PackageName}')
let cb = (World) => { console.log(`Hello ${World}!`) }

let myEmitter = new Emitter()
myEmitter.on('evt', cb)
myEmitter.emit('evt', ['World']) // `Hello World!`
console.log(myEmitter.triggers('evt', cb)) // true
myEmitter.off('evt')
console.log(myEmitter.triggers('evt', cb)) // false
```

##### ES6/TypeScript
```typescript
import Emitter from '${PackageName}'

let myEmitter = new Emitter()
myEmitter.once('evt', console.log)
myEmitter.once('evt2', console.log)
myEmitter.emit('evt', ['hey there']) // 'hey there'
console.log(myEmitter.triggers('evt', console.log)) // false
console.log(myEmitter.triggers()) // true
myEmitter.off()
console.log(myEmitter.triggers()) // false
```

##### Browser
```html
<script src="https://unpkg.com/${PackageName}/${PackageBrowserFile}"></script>

<script>
var myEmitter = new Emitter()
myEmitter.once('evt', (param) => {
    	console.log(`Hey ${param}!`)
    }, ['there'])
myEmitter.emit('evt')
</script>
```


## API

### _`static`_ `extend(target)`

Extends target object that is passed to it with Emitter class methods. It creates new Emitter class and assigns all of it's fields and methods (including $evt) to target object. Note that those methods will override existing fields with same names and also should now be invoked on target since they rely on `this` keyword.

```typescript
function extend<T extends object>(target: T): T & Emitter
```

* __target__ _object_ An object that will be extended.

```javascript
let someObject = {someField: 'someValue'}
Emitter.extend(someObject)

someObject.on('evt', function (someParam) {
  console.log(someParam) // 'otherValue'
  console.log(this.someField) // 'someValue'
})
someObject.emit('evt', ['otherValue'])
```

### `on(event, listener, context, priority)`

Subscribes a listener to an event. Listener will persist until removed with .off(). Subscribing an existing listener again will move it to the end (or start, if priority specified) of the queue. Unique listener is considered a combo of an event name and a reference to a function. If a same callback added with a different context it will be considered as a same listener. Context parameter is skipable, if you pass boolean as 3rd argument it will be used as priority.

```typescript
function on(event: string, listener: Listener, context?: object|boolean, priority?:Boolean) : this
```

* __event__ _string_  Event name you want to subscribe to.
* __listener__ _Listener_  Listener callback to be invoked.
* __context__ _object|boolean_ `optional` Context to invoke callback with (pass as this) OR a boolean value for priority if you want to skip context
* __priority__ _Boolean_ `optional` If true will add listener to the start of the queue.

```javascript
let em = new Emitter()

em.on('evt', (val) => {}) // regular listener
em.on('evt', (val) => {}, {someField: 'someValue'}) // listener with context
em.on('evt', (val) => {}, null, true) // listener with priority (added to the start of queue)
em.on('evt', (val) => {}, true) // same

em.emit('evt', ['otherValue'])
```

### `once(event, listener, context, priority)`

Same as `.on()` but listener will be automatically removed after first invocation.

```typescript
function once(event: string, listener: Listener, context?: object, priority?:Boolean) : this
```

* __event__ _string_  Event name you want to subscribe to.
* __listener__ _Listener_  Listener callback to be invoked.
* __context__ _object|boolean_ `optional` Context to invoke callback with (pass as this) OR a boolean value for priority if you want to skip context
* __priority__ _Boolean_ `optional` If true will add listener to the start of the queue.

```javascript
let em = new Emitter()
let cb = () => {}

em.once('evt', cb)
console.log( em.triggers('evt', cb) ) // true

em.emit('evt')
console.log( em.triggers('evt', cb) ) // false
```

### `off(event, listener)`

If both arguments are passed it removes the listener if such exists. If only event name is passed it will remove all the listeners for that event. If no arguments passed it will purge all the listeners for current emitter. Distinction is made by the length of the `arguments` variable to avoid undesired behaviour when `null` or `undefined` are passed due to an error. This means that `off('init')` will try to remove all listeners for _'init'_ event and `off(null)` will try to remove all events for  _'null'_ event.

```typescript
function off(event?: string, listener?: Function) : this
```

* __event__ _string_ `optional` Event name you want to unsubscribe from.
* __listener__ _Listener_ `optional` Listener callback you want to remove.

```javascript
let em = new Emitter()
let cb = () => {}
em.on('evt', cb) // removed on 1sk off
em.on('evt', () => {}) // removed on 2sk off
em.on('evt2', () => {}) // removed on 3sk off
// removes specific listener
em.off('evt', cb)
// removes all listeners for event
em.off('evt')
// removes all listeners completely
em.off()
```

### `emit(event, args)`

If both arguments are passed it removes the listener if such exists. If only event name is passed it will remove all the listeners for that event. If no arguments passed it will purge all the listeners for current emitter. Distinction is made by the length of the `arguments` variable to avoid undesired behaviour when `null` or `undefined` are passed due to an error. This means that `off('init')` will try to remove all listeners for _'init'_ event and `off(null)` will try to remove all events for  _'null'_ event.

```typescript
function emit(event: string, args?:any[]) : this
```

* __event__ _string_  Event name whose listeners should be invoked.
* __args__ _any[]_ `optional` Array of arguments that should be passed to each listener callback.

```javascript
let em = new Emitter()

// this listeners stops propagation and removes itself
em.once('evt', (arg1, arg2) => {
  console.log(arg1) // 'a'
  console.log(arg2) // 'b'
  return 'stopEmit'
})

// this listener is triggered on second emit
em.on('evt', () => {
  // never triggered
})

em.emit('evt', ['a', 'b'])
em.emit('evt')
```

### `triggers(event, listener)`

If both arguments are passed then it will check whether specific listener is subscribed for specific event. If only event name is passed it will check if there are any listeners subscribed for that event. If no arguments passed it will check if emitter has any listeners at all. Distinction is made by the length of the `arguments` variable to avoid undesired behaviour when `null` or `undefined` are passed due to an error. This means that `triggers('init')` will check if there are any listeners fot the event _'init'_ and `triggers(null)` will check if there are any listeners fot the event  _'null'_.

```typescript
function triggers(event?: string, listener?: Function): boolean
```

* __event__ _string_ `optional` Event name for which to look.
* __listener__ _Function_ `optional` Reference to a function instance that was used when subscribing.

```javascript
let em = new Emitter()
let cb = () => {}

em.on('evt', cb)
em.on('evt', () => {})
em.on('evt3', () => {})

console.log( em.triggers('evt', cb) ) // true
em.off('evt', cb)
console.log( em.triggers('evt', cb) ) // false

console.log( em.triggers('evt') ) // true
em.off('evt')
console.log( em.triggers('evt') ) // false

console.log( em.triggers() ) // true
em.off()
console.log( em.triggers() ) // false
```
