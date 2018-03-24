## What & Why
A sub 1Kb event emitter class with broader functionality.

Why another one ?

I needed some specific but not unheard of features of event emitter and all the lightweight implementations I founds were all missing one or the other, so I ended up making my own with set of features that I needed. It's not better or worse than other ones, it just combines a specific set.
 
So here's what I needed from event emitter and ended up implementing in this one:
* Compact size, 1Kb or less.
* Instantiate with `new` as well as extend existing object.
* Add listeners once or until removed.
* Reliable listener removal (usually `once` were implemented as wrappers so you couldn't remove them by same listener reference).
* Ability to remove all listeners for given event. See `.off(event)`
* Ability to remove all listeners for all events. See `.off()`
* Priority listeners (added to the start of the queue instead of end). See `.on()`
* Ability to pass context to the listener as this keyword. See `.on()`
* Ability to stop propagation of current event, smth like `preventDefaults`. See `.emit()`
* Ability to pass arguments together with event. See `.emit()`
* Ability to check whether specific listener is subscribed for a specific event. See `.triggers()`
* Ability to check whether emitter has any listeners subscribed for specified event or any listeners at all. See `.triggers()`
* Available under diferent formats (ES3, ES5, ES6, Browser, inline)

## Stats
#### Coverage
 
Type | Coverage
--- | ---
Statements | 100 ( 66/66)
Branches | 100 ( 42/42)
Functions | 100 ( 9/9)
Lines | 100 ( 63/63)

#### `dist` directory size listing

Name | Bytes | Gzip | %
--- | --- | --- | ---
Emitter.es3.browser.js | 3289 | 813 | 24%
Emitter.es3.browser.min.js | 1022 | 501 | 49%
Emitter.es3.inlined.js | 3286 | 810 | 24%
Emitter.es3.inlined.min.js | 1019 | 499 | 48%
Emitter.es3.umd.js | 4120 | 976 | 23%
Emitter.es3.umd.min.js | 1276 | 607 | 47%
Emitter.es6.js | 3076 | 794 | 25%
Emitter.es6.min.js | 899 | 493 | 54%
Emitter.js | 3161 | 843 | 26%
Emitter.min.js | 975 | 535 | 54%

## Usage

##### Node

```javascript
const Emitter = require('kilo-emitter')
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
import Emitter from 'kilo-emitter'

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
 <script src="Emitter.js"></script>

<script src="Emitter.js">
var myEmitter = new Emitter()
myEmitter.once('evt', (param) => {
    	console.log(`Hey ${param}!`)
    }, ['there'])
myEmitter.emit('evt')
</script>
```



##### Inlined
Or you can just grab this compiled inlined version (__1019 Bytes__) and copy-paste it in your code.
 ```javascript
var Emitter=function(){function t(){this.$evt={}}return t.extend=function(e){var n;return e&&"object"==typeof e&&(n=new t,["$evt","on","off","once","emit","triggers"].forEach(function(t){e[t]=n[t]})),e},t.prototype.on=function(t,e,n,o){var i,r=this.$evt;return t&&e&&("boolean"==typeof n?(o=n,n=null):e.$ctx=n,(i=r[t])?(this.off(t,e),o?i.unshift(e):i.push(e)):i=[e],r[t]=i),this},t.prototype.once=function(t,e,n,o){return t&&e&&(e.$once=!0,this.on(t,e,n,o)),this},t.prototype.off=function(t,e){var n,o,i=arguments.length,r=this.$evt;return 0===i?this.$evt={}:1===i?delete r[t]:-1<(n=(o=r[t])?o.indexOf(e):-1)&&(o.splice(n,1),o.length||delete r[t]),this},t.prototype.emit=function(t,e){var n,o,i,r=this.$evt[t];if(r&&(i=r.length))for(r=r.slice(),n=0;n<i;n++)"stopEmit"===(o=r[n]).apply(o.$ctx,e)&&(n=i),o.$once&&(this.off(t,o),delete o.$once);return this},t.prototype.triggers=function(t,e){var n,o=arguments.length,i=this.$evt;return o?!!(n=i[t])&&(!(1<o)||-1<n.indexOf(e)):!!Object.getOwnPropertyNames(i).length},t}();
```

## API


###  `emit(event, args)`
Emits an event invoking all the listeners subscribed to it and passing rest of the arguments to them. Listeners array is cloned to prevent errors due to array mutation while event is still being emitted. If listener returns a string 'stopEmit' then the process will be aborted and rest of the listeners in queue will not be invoked, if some of then were added as .once() then it means that they will not be removed and will remain in queue until invoked or removed explicitly.
##### Signature:
```typescript
function emit(event:string, args?:undefined): this
// @param	event : Event name whose listeners should be invoked.
// @param	args : Array of arguments that should be passed to each listener callback.
// @returns	Emitter instance for chaining

```
##### Examples

```typescript

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




###  `off(event, listener)`
If both arguments are passed it removes the listener if such exists. If only event name is passed it will remove all the listeners for that event. If no arguments passed it will purge all the listeners for current emitter. Distinction is made by the length of the `arguments` variable to avoid undesired behaviour when `null` or `undefined` are passed due to an error. This means that `off('init')` will try to remove all listeners for _'init'_ event and `off(null)` will try to remove all events for  _'null'_ event.
##### Signature:
```typescript
function off(event?:string, listener?:Function): this
// @param	event : Event name you want to unsubscribe from.
// @param	listener : Listener callback you want to remove.
// @returns	Emitter instance for chaining

```
##### Examples

```typescript

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




###  `on(event, listener, context, priority)`
Subscribes a listener to an event. Listener will persist until removed with .off(). Subscribing an existing listener again will move it to the end (or start, if priority specified) of the queue. Unique listener is considered a combo of an event name and a reference to a function. If a same callback added with a different context it will be considered as a same listener. Context parameter is skipable, if you pass boolean as 3rd argument it will be used as priority.
##### Signature:
```typescript
function on(event:string, listener:Listener, context?:undefined, priority?:Boolean): this
// @param	event : Event name you want to subscribe to.
// @param	listener : Listener callback to be invoked.
// @param	context : Context to invoke callback with (pass as this) OR a boolean value for priority if you want to skip context
// @param	priority : If true will add listener to the start of the queue.
// @returns	Emitter instance for chaining

```
##### Examples

```typescript

let em = new Emitter()

// regulat listener
em.on('evt', (val) => {})

// listener with context
em.on('evt', (val) => {}, {someField: 'someValue'})

// listener with priority (added to the start of queue)
em.on('evt', (val) => {}, null, true)
// same
em.on('evt', (val) => {}, true)

em.emit('evt', ['otherValue'])
```




###  `once(event, listener, context, priority)`
Same as `.on()` but listener will be automatically removed after first invocation.
##### Signature:
```typescript
function once(event:string, listener:Listener, context?:object, priority?:Boolean): this
// @param	event : Event name you want to subscribe to.
// @param	listener : Listener callback to be invoked.
// @param	context : Context to invoke callback with (pass as this).
// @param	priority : If true will add listener to the start of the queue.
// @returns	Emitter instance for chaining

```
##### Examples

```typescript

let em = new Emitter()
let cb = () => {}

em.once('evt', cb)

console.log( em.triggers('evt', cb) ) // true

em.emit('evt')

console.log( em.triggers('evt', cb) ) // false
```




###  `triggers(event, listener)`
If both arguments are passed then it will check whether specific listener is subscribed for specific event. If only event name is passed it will check if there are any listeners subscribed for that event. If no arguments passed it will check if emitter has any listeners at all. Distinction is made by the length of the `arguments` variable to avoid undesired behaviour when `null` or `undefined` are passed due to an error. This means that `triggers('init')` will check if there are any listeners fot the event _'init'_ and `triggers(null)` will check if there are any listeners fot the event  _'null'_.
##### Signature:
```typescript
function triggers(event?:string, listener?:Function): boolean
// @param	event : Event name.
// @param	listener : Listener function.
// @returns	Boolean value determining whether check succeeded or not.

```
##### Examples

```typescript

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




### _`static`_ `extend(target)`
Extends target object that is passed to it with Emitter class methods. It creates new Emitter class and assigns all of it's fields and methods (including $evt) to target object. Note that those methods will override existing fields with same names and also should now be invoked on target since they rely on `this` keyword.
##### Signature:
```typescript
function extend(target:T): undefined
// @param	target : An object that will be extended.
// @returns	Extended target object

```
##### Examples

```typescript

let someObject = {someField: 'someValue'}
Emitter.extend(someObject)

someObject.on('evt', function (someParam) {
  console.log(someParam) // 'otherValue'
  console.log(this.someField) // 'someValue'
})
someObject.emit('evt', ['otherValue'])
```


