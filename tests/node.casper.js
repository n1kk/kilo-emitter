const Emitter = require('../dist/emitter.js').Emitter

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

let test = casper.test

test('integrity test', 11, function (t) {

	emitter = new Emitter()

	t.assertTruthy(emitter, 'should initialize with "new" keyword')

  extended = Emitter.extend(target)
  extendedB = Emitter.extend(targetB)

  t.assertTruthy(extended, 'should initialize with "extend" method')
  t.assertEquals(extended, target, 'extend should return same object')

  Object.getOwnPropertyNames(Emitter.prototype).filter(m => m !== 'constructor').forEach(method => {
    t.assertTruthy(extended[method], 'extended should have method "'+method+'"')
  })

  t.assertEquals(extendedB.method, targetB.method, "should preserve target object fields");

	t.assertEquals(Emitter.extend(null), null, "extend should ignore non object targets (null)");
  t.assertEquals(Emitter.extend(), undefined, "extend should ignore non object targets (empty)");
  t.assertEquals(Emitter.extend(2), 2, "extend should ignore non object targets (Number(2))");

  t.done()
});

test('running same tests for new emitter and extended object', 0, function (t) {
  t.done();

  [emitter, extended].forEach(e => {
    let m = (text) => `[${e === emitter ? 'emitter' : 'extended'}] ${text}`

    test(m('.on() tests'), 6, function (t) {
      let callbacks = data.on = genCallbacks(2)

      e.on('on1', callbacks.cb1)
      e.emit('on1')

      t.assertEquals(callbacks.called.cb1, 1, m('should invoke listener'))

      e.on('on1', callbacks.cb1)
      e.emit('on1')
      t.assertEquals(callbacks.called.cb1, 2, m('should not register same function twice as a listener for same event'))

      e.on('on2', callbacks.cb2)
      e.on('on2', callbacks.cb1)
      e.emit('on2')
      t.assertEquals(callbacks.last.name, 'cb1', m('should call listeners in order of registration'))

      callbacks.called.cb2 = 0
      e.on('on3', callbacks.cb2)
      e.on('on3', callbacks.cb1)
      e.on('on3', callbacks.cb2)
      e.emit('on3')
      t.assertTruthy(callbacks.last.name === 'cb2' && callbacks.called.cb2 === 1, m('should call readded listener only once and in correct position'))

      e.on('on4')
      t.assertFalsy(e.triggers('on4'), m('should ignore if no listener passed'))

      try {
        e.on()
        t.pass(m('should not throw if no arguments passed'))
      } catch (e) {
        t.fail(m('should not throw if no arguments passed'))
      }

      t.done()
    });

    test(m('.once() tests'), 5, function (t) {
      let callbacks = data.once = genCallbacks(2)

      e.on('once1', callbacks.cb1)
      e.once('once1', callbacks.cb2)
      e.emit('once1')

      t.assertTruthy(callbacks.called.cb1 === 1
        && callbacks.called.cb2 === 1
        && callbacks.last.name === 'cb2', m("should invoke 'once' listeners normally"))

      e.emit('once1')

      t.assertTruthy(callbacks.called.cb1 === 2
        && callbacks.called.cb2 === 1
        && callbacks.last.name === 'cb1', m("should invoke 'once' listeners only once"))

      t.assertEquals(e.triggers('once1', callbacks.cb2), false, "should remove 'once' listeners after invocation")

      e.once('once2')
      t.assertFalsy(e.triggers('once2'), m('should ignore if no listener passed'))

      try {
        e.once()
        t.pass(m('should not throw if no arguments passed'))
      } catch (e) {
        t.fail(m('should not throw if no arguments passed'))
      }

      t.done()
    });

    test(m('.triggers() tests'), 8, function (t) {

      t.assertTruthy(e.triggers('on1', data.on.cb1), 'should have specific registered listener')
      t.assertTruthy(e.triggers('on2'), 'should have listeners for specific event')
      t.assertTruthy(e.triggers(), 'should have any listeners at all')

      t.assertFalsy(e.triggers('on11', data.on.cb1), 'should not have specific listener for nonexistent event')
      t.assertFalsy(e.triggers('on1', () => {}), 'should not have unregistered listener for existing event')
      t.assertFalsy(e.triggers('on11'), 'should not have any listeners for nonexistent event')

      let em = new Emitter(), ex = Emitter.extend({})

      t.assertFalsy(em.triggers(), 'should not have eny listeners for empty emitter')
      t.assertFalsy(ex.triggers(), 'should not have eny listeners for empty extended emitter')

      t.done()
    });

    test(m('.off() tests'), 10, function (t) {

      e.off('on1', data.on.cb1)
      t.assertFalsy(e.triggers('on1', data.on.cb1), 'off(event, listener) should remove specific listener')

      e.off('on2')
      t.assertFalsy(e.triggers('on2'), 'off(event) should remove all listeners for event')

      e.off()
      t.assertFalsy(e.triggers(), 'off() should remove all listeners')

      let callbacks = data.emit = genCallbacks(1)

      e.on('off1', callbacks.cb1)
      e.off('off1', callbacks.cb1)
      t.assertFalsy(e.triggers('off1'), m('should not have listeners for event if events last one was removed directly'))
      t.assertFalsy(e.triggers(), m('should not have listeners at all if last one was removed directly'))

      t.doesNotThrow(() => e.off('off1', () => {}), m('should not throw if nonexistent listener passed'))
      t.doesNotThrow(() => e.off('off2'), m('should not throw if nonexistent event passed'))

      try {
        e.off('off1', () => {})
        t.pass(m('should not throw if nonexistent listener passed'))
      } catch (e) {
        t.fail(m('should not throw if nonexistent listener passed'))
      }

      try {
        e.off('off2')
        t.pass(m('should not throw if nonexistent event passed'))
      } catch (e) {
        t.fail(m('should not throw if nonexistent event passed'))
      }

      e.once('off2', callbacks.cb1)
      e.off('off2', callbacks.cb1)
      t.assertFalsy(e.triggers('off1'), m('should remove listeners added with .once()'))

      t.done()
    });

    test(m('.emit() tests'), 5, function (t) {

      let callbacks = data.emit = genCallbacks(100)

      let n = 0
      callbacks.list.forEach(cb => e.on('emit2', () => {cb(); n++}))
      e.emit('emit2')
      t.assertEquals(callbacks.called.reduce((c,n) => c + n), n, m('should invoke all listeners'))

      let ctx = {context: true}
      e.on('emit1', callbacks.cb1, ctx)
      e.emit('emit1', 'arg1', 'arg2')
      t.assertEquals(callbacks.last.context, ctx, m('should pass context to callback'))
      t.assertEquals(callbacks.last.args[0], 'arg1', m('should pass arguments to callback'))
      t.assertEquals(callbacks.last.args.length, 2, m('should pass all arguments to callback'))

      e.off()

      callbacks = data.emit = genCallbacks(1)

      e.on('emit2', callbacks.cb1)
      e.emit()

      t.assertEquals(callbacks.last.name, undefined, m('should ignore if no arguments are passed'))

      t.done()
    });

    test(m('special cases tests'), 3, function (t) {

      let callbacks = data.special = genCallbacks(3)

      e.on('sp1', callbacks.cb1)
      e.on('sp1', () => {
        callbacks.cb2()
        t.assertTruthy(e.triggers('sp1', callbacks.cb3), m('should have next listener present while in callback'))
        e.off('sp1', callbacks.cb3)
        t.assertFalsy(e.triggers('sp1', callbacks.cb3), m('should not have next listener after removal while in callback'))
      })
      e.on('sp1', callbacks.cb3)

      e.emit('sp1')
      t.assertEquals(callbacks.last.name, 'cb3', m('should invoke next callback even if it was removed'))

      t.done()
    });

    test(m('common tests'), 11, function (t) {

      let callbacks = data.chainable = genCallbacks(3)

      t.assertEquals(e.on('ch1', callbacks.cb1), e, m('on(e, l) should return this for chaining'))
      t.assertEquals(e.once('ch1', callbacks.cb2), e, m('once(e, l) should return this for chaining'))
      t.assertEquals(e.emit('ch1'), e, m('emit(e) should return this for chaining'))
      t.assertEquals(e.off('ch1', callbacks.cb1), e, m('off(e, l) should return this for chaining'))
      t.assertEquals(e.off('ch1'), e, m('off(e) should return this for chaining'))
      t.assertEquals(e.off(), e, m('off() should return this for chaining'))

      let call = method => (method) => method('asd', () => {})

      t.assertRaises(call(e.on), [], m('on() should throw if called from wrong context'))
      t.assertRaises(call(e.once), [], m('once() should throw if called from wrong context'))
      t.assertRaises(call(e.emit), [], m('emit() should throw if called from wrong context'))
      t.assertRaises(call(e.off), [], m('off() should throw if called from wrong context'))
      t.assertRaises(call(e.triggers), [], m('triggers() should throw if called from wrong context'))

      t.done()
    });

  })

})
