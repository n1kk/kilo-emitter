import { expect, use, assert, should as should_ } from 'chai';
import 'mocha';
import Emitter from '../Emitter';
//let Emitter = require("../Emitter.ts")
let should = should_()

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
        .forEach((method:keyof Emitter) => {
          should.exist(extended[method])
        })
      expect(target.field).to.equal(extended.field)
    });

    it('should should ignore non object targets', () => {
      expect(Emitter.extend(null)).to.equal(null)
      expect(Emitter.extend(undefined)).to.equal(undefined)
      expect(Emitter.extend(<any>2)).to.equal(2)
    });


  })

  /*it('should register a listener and emit', () => {
    let em = new Emitter(), called;
    em.on('a', () => called = true)
    em.emit('a')
    expect(called).to.equal(true);
  });

  it('should move registered listener to the end', () => {
    let em = new Emitter(), called = 0,
      cb1 = () => called += 1,
      cb2 = () => called += 2;

    em.on('a', cb1)
    em.on('a', cb2)
    em.on('a', cb1)
    em.emit('a')
    expect(called).to.equal(3);
  });

  it('should invoke cb with right args and this', () => {
    let em = new Emitter()
    em.on('a', function callback(d1:number, d2:number, d3:number) {
      expect(d1).to.equal(1);
      expect(d2).to.equal(2);
      expect(d3).to.equal(3);
      expect(this).to.equal(em);
    })
    em.emit('a', 1, 2, 3)
  });

  it('should unregister a listener', () => {
    let em = new Emitter(), called = 0,
      cb = () => called++

    em.on('a', cb)
    em.emit('a')
    em.off('a', cb)
    em.emit('a')

    expect(called).to.equal(1);
  });

  it('should call all callbacks', () => {
    let em = new Emitter(), called = 0;

    for (let i = 0; i < 10; i++)
      em.on('a', () => called++)

    em.emit('a')

    expect(called).to.equal(10);
  });

  it('should unregister listener with `return false`', () => {
    let em = new Emitter(), called = 0;

    for (let i = 0; i < 10; i++)
      // should increment and unregister
      em.on('a', () => !(++called))

    em.emit('a')
    em.emit('a')

    expect(called).to.equal(10);
  });

  it('should register priority and call them first ', () => {
    let em = new Emitter(), called = 0;

    em.on('a', () => called += 1)
    em.on('a', () => called = 3, {},true)

    em.emit('a')

    expect(called).to.equal(4);
  });*/


});
