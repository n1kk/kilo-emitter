let chai = require('chai')
import { expect, use } from 'chai';
let mocha =  require('mocha')
let Emitter = require("../Emitter")

describe('Emitter class', () => {

  it('should register a listener and emit', () => {
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
  });


});
