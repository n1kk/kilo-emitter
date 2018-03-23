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
 
${CoverageTable}

#### `dist` directory size listing

${CompiledSizeTable}

## Usage

##### Node
${UsageNode}

##### ES6/TypeScript
${UsageES6}

##### Browser
${UsageBrowser}

##### Inlined
Or you can just grab this compiled inlined version (__${InlineCompiledSize} Bytes__) and copy-paste it in your code.
 ```javascript
${InlineCompiledCode}
```

## API

${API}
