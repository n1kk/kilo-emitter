import { expect, use, assert, should as should_ } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import * as EmitterClass from "../dist/emitter";
// declare const Emitter: Emitter;

let should = should_()

export default function test(Emitter: typeof EmitterClass.default) {

  describe('Emitter class', () => {

    describe('integrity test', () => {

      it('should initialize with "new" keyword', () => {
        let em = new Emitter();
        should.exist(em)
      });

      it('should initialize with "extend" method', () => {
        let target = {field: 1}, extended = Emitter.extend(target)
        should.exist(extended)
        extended.should.equal(target)
        Object.getOwnPropertyNames(Emitter.prototype)
          .filter(m => m !== 'constructor')
          .forEach((method:any) => {
            should.exist((<any>extended)[method])
          })
        expect(target.field).to.equal(extended.field)
      });

      it('should should ignore non object targets', () => {
        expect(Emitter.extend(null)).to.equal(null)
        expect(Emitter.extend(undefined)).to.equal(undefined)
        expect(Emitter.extend(<any>2)).to.equal(2)
      });


    })

    describe('running same tests for new emitter and extended object', () => {
      let target = {field: 1}, extended = Emitter.extend(target)
      let emitter = new Emitter();

      [emitter, extended].forEach(em => {
        let m = (text: string) => `[${em === emitter ? 'emitter' : 'extended'}] ${text}`

        // ------------------------- [ .on() ] -------------------------

        describe(m('.on() tests'), () => {

          it('should invoke listener', () => {
            let cb = sinon.spy()
            em.on('ev1', cb)
              .emit('ev1')
            expect(cb.called).to.be.true
          })

          it('should not register same function twice as a listener for same event', () => {
            let cb = sinon.spy()
            em.on('ev1', cb)
              .on('ev1', cb)
              .emit('ev1')
            expect(cb.calledOnce).to.be.true
          })

          it('should call listeners in order of registration', () => {
            let cb1 = sinon.spy(), cb2 = sinon.spy()
            em.on('ev1', cb1)
              .on('ev1', cb2)
              .emit('ev1')
            expect(cb1.calledBefore(cb2)).to.be.true
          })

          it('should call readded listener only once and in correct position', () => {
            let cb1 = sinon.spy(), cb2 = sinon.spy()
            em.on('ev1', cb1)
              .on('ev1', cb2)
              .on('ev1', cb1)
              .emit('ev1')
            expect(cb1.calledOnce).to.be.true
            expect(cb1.calledAfter(cb2)).to.be.true
          })

          it('should add priority listeners to the front of the queue', () => {
            let cb1 = sinon.spy()
              , cb2 = sinon.spy()
              , cb3 = sinon.spy()
              , cb4 = sinon.spy()
            em.on('ev1', cb1)
              .on('ev1', cb2, true)
              .on('ev1', cb3, null, true)
              .on('ev1', cb4, false)
              .emit('ev1')
            expect(cb1.called).to.be.true
            expect(cb2.called).to.be.true
            expect(cb3.called).to.be.true
            expect(cb4.called).to.be.true
            expect(cb2.calledBefore(cb1)).to.be.true
            expect(cb3.calledBefore(cb2)).to.be.true
            expect(cb4.calledAfter(cb1)).to.be.true
          })

          it('should ignore if no listener passed', () => {
            (<any>em.on)('ev2')
            expect(em.triggers('ev2')).to.be.false
          })

          it('should ignore if no listener passed', () => {
            expect(() => (<any>em.on)()).not.to.throw()
          })

        })

        // ------------------------- [ .once() ] -------------------------

        describe(m('.once() tests'), () => {

          it('should invoke \'once\' listeners only once', () => {
            let cb = sinon.spy()
            em.once('ev3', cb)
              .emit('ev3')
              .emit('ev3')
            expect(cb.calledOnce).to.be.true
          })

          it('should remove \'once\' listeners after invocation', () => {
            let cb = sinon.spy()
            em.once('ev3', cb)
              .emit('ev3')
            expect(em.triggers('ev3', cb)).to.be.false
          })

          it('should ignore if no listener passed', () => {
            let cb = sinon.spy();
            (<any>em.once)('ev4')
            expect(em.triggers('ev4')).to.be.false
          })

          it('should not throw if no arguments passed', () => {
            expect(em.once).not.to.throw()
          })

        })

        // ------------------------- [ .triggers() ] -------------------------

        describe(m('.triggers() tests'), () => {

          it('should detect specific registered listener', () => {
            let cb = sinon.spy()
            em.once('ev5', cb)
            expect(em.triggers('ev5', cb)).to.be.true
          })

          it('should detect listeners for specific event', () => {
            let cb = sinon.spy()
            em.once('ev6', cb)
            expect(em.triggers('ev6')).to.be.true
          })

          it('should detect any listeners at all', () => {
            expect(em.triggers()).to.be.true
          })

          it('should not detect specific unregistered listener', () => {
            expect(em.triggers('ev6', sinon.spy())).to.be.false
          })

          it('should not detect specific listener for nonexistent event', () => {
            expect(em.triggers('evv6', sinon.spy())).to.be.false
          })

          it('should not detect any listener for nonexistent event', () => {
            expect(em.triggers('evv6', sinon.spy())).to.be.false
          })

          it('should not have eny listeners for empty emitter', () => {
            expect(em.triggers('evv6', sinon.spy())).to.be.false
          })

        })

        // ------------------------- [ .off() ] -------------------------

        describe(m('.off() tests'), () => {

          it('off(event, listener) should remove specific listener', () => {
            let cb = sinon.spy()
            em.on('ev7', cb)
              .off('ev7', cb)
              .emit('ev7')
            expect(cb.called).to.be.false
            expect(em.triggers('ev7', cb)).to.be.false
          })

          it('off(event) should remove all listeners for event', () => {
            expect(em.triggers('ev6')).to.be.true
            em.off('ev6')
            expect(em.triggers('ev6')).to.be.false
          })

          it('off() should remove all listeners', () => {
            expect(em.triggers()).to.be.true
            em.off()
            expect(em.triggers()).to.be.false
          })

          it('should not have listeners for event if events last one was removed directly', () => {
            let cb = sinon.spy()
            em.on('ev8', cb)
            expect(em.triggers('ev8')).to.be.true
            em.off('ev8', cb)
            expect(em.triggers('ev8')).to.be.false
            em.emit('ev8')
            expect(cb.called).to.be.false
          })

          it('should not have listeners at all if last one was removed directly', () => {
            em.off()
            expect(em.triggers()).to.be.false
            let cb = sinon.spy()
            em.on('ev8', cb)
            expect(em.triggers()).to.be.true
            em.off('ev8', cb)
            expect(em.triggers()).to.be.false
            em.emit('ev8')
            expect(cb.called).to.be.false
          })

          it('should not throw if nonexistent listener passed', () => {
            em.on('ev8', sinon.spy())
            expect(() => em.off('ev8', sinon.spy())).to.not.throw()
          })

          it('should not throw if nonexistent event passed', () => {
            em.on('ev8', sinon.spy())
            expect(() => em.triggers('evv8', sinon.spy())).to.not.throw()
          })

          it('should remove listeners added with .once()', () => {
            let cb = sinon.spy()
            em.once('ev8', cb)
            expect(em.triggers('ev8', cb)).to.be.true
            em.off('ev8', cb)
              .emit('ev8')
            expect(em.triggers('ev8', cb)).to.be.false
            expect(cb.called).to.be.false
          })

        })

        // ------------------------- [ .emit() ] -------------------------

        describe(m('.emit() tests'), () => {

          it('should invoke all listeners', () => {
            let cbs = [1, 2, 3].map(n => {
              let cb = sinon.spy()
              em.on('ev9', cb)
              return cb
            })
            em.emit('ev9')
            expect(cbs.every(cb => cb.called)).to.be.true
          })

          it('should pass context to callback', () => {
            let cb = sinon.spy(),
              ctx = {val: 1}
            em.on('ev10', cb, ctx)
              .emit('ev10')
            expect(cb.calledOn(ctx)).to.be.true
          })

          it('should pass arguments to callback', () => {
            let cb = sinon.spy()
            em.on('ev10', cb)
              .emit('ev10', [1, true, "three"])
            expect(cb.calledWithExactly(1, true, "three")).to.be.true
          })

          it('should ignore if no arguments are passed', () => {
            let cb = sinon.spy()
            em.on('ev10', cb)
            expect(() => (<any>em.emit)()).to.not.throw()
            expect(cb.called).to.be.false
          })

          it('should stop emit if "stopEmit" is returned', () => {
            let cb1 = sinon.spy(() => "stopEmit"), cb2 = sinon.spy()
            em.once('ev10', cb1)
              .once('ev10', cb2)
              .emit('ev10')
            expect(cb1.called).to.be.true
            expect(cb2.called).to.be.false
            expect(em.triggers('ev10', cb1)).to.be.false
            expect(em.triggers('ev10', cb2)).to.be.true
          })

        })

        // ------------------------- [ special ] -------------------------

        describe(m('special cases tests'), () => {

          it('should clone listeners array to avoid problems with queue mutation during emit', () => {
            let cb1 = sinon.spy()
              , cb2 = sinon.spy()

            em.on('ev11', cb1)
              .on('ev11', () => {
                expect(em.triggers('ev11', cb2)).to.be.true
                em.off('ev11', cb2)
                expect(em.triggers('ev11', cb2)).to.be.false
              })
              .on('ev11', cb2)
              .emit('ev11')
            expect(cb2.called).to.be.true
          })

          it('should return this for chaining', () => {
            let cb = sinon.spy()
            expect(em.on('ev12', cb)).to.be.equal(em)
            expect(em.on('ev12', cb, {})).to.be.equal(em)
            expect(em.once('ev12', cb)).to.be.equal(em)
            expect(em.once('ev12', cb, {})).to.be.equal(em)
            expect(em.emit('ev12')).to.be.equal(em)
            expect((<any>em.emit)()).to.be.equal(em)
            expect(em.off('ev12', cb)).to.be.equal(em)
            expect(em.off('ev12')).to.be.equal(em)
            expect(em.off()).to.be.equal(em)
          })

          it('should throw if called from wrong context', () => {
            let cb
            expect(() => {
              (cb = em.on)("ev", () => {
              })
            }).to.throw()
            expect(() => {
              (cb = em.once)("ev", () => {
              })
            }).to.throw()
            expect(() => {
              (cb = em.emit)("ev", [1, 2, 3])
            }).to.throw()
            expect(() => {
              (cb = em.off)("ev", () => {
              })
            }).to.throw()
            expect(() => {
              (cb = em.triggers)("ev", () => {
              })
            }).to.throw()
          })

        })

      })

    })

  })

}
