const test = require('tape');
const { Emitter } = require('../dist/emitter.js')

let emitter,
  target = {},
  extended,
  targetB = {method: _ => 0},
  extendedB,
  data = {};

function genCallbacks(n) {
  let res = { last: {}, called: {} }
  for (var i = 0; i < n; i++) {
    res['cb'+(n+1)] = (function (n) {
      return function () {
        res.last.name = 'cb' + n
        res.last.args = arguments
        res.last.context = this
        res.called['cb' + n] = res.called['cb' + n] ? res.called['cb' + n] + 1 : 1
      }
    })(n+1)
  }
  return res
}

test('integrity test', function (t) {

	emitter = new Emitter()

	t.ok(emitter, 'should initialize with "new" keyword')

  extended = Emitter.extend(target)
  extendedB = Emitter.extend(targetB)

  t.ok(extended, 'should initialize with "extend" method')
  t.equal(extended, target, 'extend should return same object')

  Object.getOwnPropertyNames(Emitter.prototype).forEach(method => {
    t.ok(extended[method], 'extended should have method "'+method+'"')
  })

  t.equal(extendedB.method, targetB.method, "should preserve target object fields");

  t.end()
});

test('running same tests for new emitter and extended object', function (t) {
  [emitter, extended].forEach(e => {
    let m = (text) => `[${e === emitter ? 'emitter' : 'extended'}] ${text}`

    test(m('.on() tests'), function (t) {
      //t.plan(2);
      let callbacks = data.on = genCallbacks(2)

      e.on('on1', callbacks.cb1)
      e.emit('on1')

      t.equals(callbacks.called.cb1, 1, m('should invoke listener'))

      e.on('on1', callbacks.cb1)
      e.emit('on1')
      t.equals(callbacks.called.cb1, 2, m('should not register same function twice as a listener for same event'))

      e.on('on2', callbacks.cb2)
      e.on('on2', callbacks.cb1)
      e.emit('on2')
      t.equals(callbacks.last.name, 'cb1', m('should call listeners in order of registration'))

      callbacks.called.cb2 = 0
      e.on('on3', callbacks.cb2)
      e.on('on3', callbacks.cb1)
      e.on('on3', callbacks.cb2)
      e.emit('on3')
      t.ok(callbacks.last.name === 'cb2' && callbacks.called.cb2 === 1, m('should call readded listener only once and in correct position'))

      t.end()
    });

    test(m('.once() tests'), function (t) {
      //t.plan(2);
      let callbacks = data.once = genCallbacks(2)

      e.on('once1', callbacks.cb1)
      e.once('once1', callbacks.cb2)
      e.emit('once1')

      t.ok(callbacks.called.cb1 === 1
        && callbacks.called.cb2 === 1
        && callbacks.last.name === 'cb1', 1, m("should invoke 'once' listeners normally"))

      e.emit('once1')

      t.ok(callbacks.called.cb1 === 2
        && callbacks.called.cb2 === 1
        && callbacks.last.name === 'cb1', 1, m("should invoke 'once' listeners only once"))

      t.equal(e.hasListeners('once1', callbacks.cb2), false, "should remove 'once' listeners after invocation")

      t.end()
    });

    test(m('.off() tests'), function (t) {
      //t.plan(2);

      t.end()
    });

  })

})
