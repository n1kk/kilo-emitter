const test = require('tape');

module.exports = function (Emitter, onErr, onDone) {

  let emitter,
    target = {},
    extended,
    targetB = {method: _ => 0},
    extendedB,
    data = {};

  function genCallbacks(n) {
    let res = { last: {}, called: [], list: []}
    for (var i = 1; i <= n; i++) {
      res['cb'+i] = (function (n) {
        return function () {
          res.last.name = 'cb' + n
          res.last.args = arguments
          res.last.context = this
          res.called[n] = res.called['cb' + n] = res.called['cb' + n] ? res.called['cb' + n] + 1 : 1
        }
      })(i)
      res.list.push(res['cb'+i])
    }
    return res
  }

  test.onFailure(onErr)

  test.onFinish(function () {
    setTimeout(() => onDone(test), 100)
  })

  test('integrity test', function (t) {

    emitter = new Emitter()

    t.ok(emitter, 'should initialize with "new" keyword')

    extended = Emitter.extend(target)
    extendedB = Emitter.extend(targetB)

    t.ok(extended, 'should initialize with "extend" method')
    t.equal(extended, target, 'extend should return same object')

    Object.getOwnPropertyNames(Emitter.prototype).filter(m => m !== 'constructor').forEach(method => {
      t.ok(extended[method], 'extended should have method "'+method+'"')
    })

    t.equal(extendedB.method, targetB.method, "should preserve target object fields");

    t.equal(Emitter.extend(null), null, "extend should ignore non object targets (null)");
    t.equal(Emitter.extend(), undefined, "extend should ignore non object targets (empty)");
    t.equal(Emitter.extend(2), 2, "extend should ignore non object targets (Number(2))");

    t.end()
  });

  test('running same tests for new emitter and extended object', function (t) {
    t.end();

    [emitter, extended].forEach(e => {
      let m = (text) => `[${e === emitter ? 'emitter' : 'extended'}] ${text}`

      test(m('.on() tests'), function (t) {
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

        e.on('on4')
        t.notOk(e.triggers('on4'), m('should ignore if no listener passed'))

        t.doesNotThrow(() => { e.on() }, m('should not throw if no arguments passed'))

        t.end()
      });

      test(m('.once() tests'), function (t) {
        let callbacks = data.once = genCallbacks(2)

        e.on('once1', callbacks.cb1)
        e.once('once1', callbacks.cb2)
        e.emit('once1')

        t.ok(callbacks.called.cb1 === 1
          && callbacks.called.cb2 === 1
          && callbacks.last.name === 'cb2', m("should invoke 'once' listeners normally"))

        e.emit('once1')

        t.ok(callbacks.called.cb1 === 2
          && callbacks.called.cb2 === 1
          && callbacks.last.name === 'cb1', m("should invoke 'once' listeners only once"))

        t.equal(e.triggers('once1', callbacks.cb2), false, "should remove 'once' listeners after invocation")

        e.once('once2')
        t.notOk(e.triggers('once2'), m('should ignore if no listener passed'))

        t.doesNotThrow(e.once, m('should not throw if no arguments passed'))

        t.end()
      });

      test(m('.triggers() tests'), function (t) {

        t.ok(e.triggers('on1', data.on.cb1), 'should have specific registered listener')
        t.ok(e.triggers('on2'), 'should have listeners for specific event')
        t.ok(e.triggers(), 'should have any listeners at all')

        t.notOk(e.triggers('on11', data.on.cb1), 'should not have specific listener for nonexistent event')
        t.notOk(e.triggers('on1', () => {}), 'should not have unregistered listener for existing event')
        t.notOk(e.triggers('on11'), 'should not have any listeners for nonexistent event')

        let em = new Emitter(), ex = Emitter.extend({})

        t.notOk(em.triggers(), 'should not have eny listeners for empty emitter')
        t.notOk(ex.triggers(), 'should not have eny listeners for empty extended emitter')

        t.end()
      });

      test(m('.off() tests'), function (t) {

        e.off('on1', data.on.cb1)
        t.notOk(e.triggers('on1', data.on.cb1), 'off(event, listener) should remove specific listener')

        e.off('on2')
        t.notOk(e.triggers('on2'), 'off(event) should remove all listeners for event')

        e.off()
        t.notOk(e.triggers(), 'off() should remove all listeners')

        let callbacks = data.emit = genCallbacks(1)

        e.on('off1', callbacks.cb1)
        e.off('off1', callbacks.cb1)
        t.notOk(e.triggers('off1'), m('should not have listeners for event if events last one was removed directly'))
        t.notOk(e.triggers(), m('should not have listeners at all if last one was removed directly'))

        t.doesNotThrow(() => e.off('off1', () => {}), m('should not throw if nonexistent listener passed'))
        t.doesNotThrow(() => e.off('off2'), m('should not throw if nonexistent event passed'))

        e.once('off2', callbacks.cb1)
        e.off('off2', callbacks.cb1)
        t.notOk(e.triggers('off1'), m('should remove listeners added with .once()'))

        t.end()
      });

      test(m('.emit() tests'), function (t) {

        let callbacks = data.emit = genCallbacks(100)

        let n = 0
        callbacks.list.forEach(cb => e.on('emit2', () => {cb(); n++}))
        e.emit('emit2')
        t.equal(callbacks.called.reduce((c,n) => c + n), n, m('should invoke all listeners'))

        let ctx = {context: true}
        e.on('emit1', callbacks.cb1, ctx)
        e.emit('emit1', 'arg1', 'arg2')
        t.equal(callbacks.last.context, ctx, m('should pass context to callback'))
        t.equal(callbacks.last.args[0], 'arg1', m('should pass arguments to callback'))
        t.equal(callbacks.last.args.length, 2, m('should pass all arguments to callback'))

        e.off()

        callbacks = data.emit = genCallbacks(1)

        e.on('emit2', callbacks.cb1)
        e.emit()

        t.equal(callbacks.last.name, undefined, m('should ignore if no arguments are passed'))

        t.end()
      });

      test(m('special cases tests'), function (t) {

        let callbacks = data.special = genCallbacks(3)

        e.on('sp1', callbacks.cb1)
        e.on('sp1', () => {
          callbacks.cb2()
          t.ok(e.triggers('sp1', callbacks.cb3), m('should have next listener present while in callback'))
          e.off('sp1', callbacks.cb3)
          t.notOk(e.triggers('sp1', callbacks.cb3), m('should not have next listener after removal while in callback'))
        })
        e.on('sp1', callbacks.cb3)

        e.emit('sp1')
        t.equals(callbacks.last.name, 'cb3', m('should invoke next callback even if it was removed'))

        t.end()
      });

      test(m('common tests'), function (t) {

        let callbacks = data.chainable = genCallbacks(3)

        t.equals(e.on('ch1', callbacks.cb1), e, m('on(e, l) should return this for chaining'))
        t.equals(e.once('ch1', callbacks.cb2), e, m('once(e, l) should return this for chaining'))
        t.equals(e.emit('ch1'), e, m('emit(e) should return this for chaining'))
        t.equals(e.off('ch1', callbacks.cb1), e, m('off(e, l) should return this for chaining'))
        t.equals(e.off('ch1'), e, m('off(e) should return this for chaining'))
        t.equals(e.off(), e, m('off() should return this for chaining'))

        let call = method => (method) => method('asd', () => {})

        t.throws(call(e.on), m('on() should throw if called from wrong context'))
        t.throws(call(e.once), m('once() should throw if called from wrong context'))
        t.throws(call(e.emit), m('emit() should throw if called from wrong context'))
        t.throws(call(e.off), m('off() should throw if called from wrong context'))
        t.throws(call(e.triggers), m('triggers() should throw if called from wrong context'))

        t.end()

      });

    })

  })


}
