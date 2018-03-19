const { Emitter } = require('../dist/emitter.js')
const testBase = require('./tape.base');

testBase(Emitter, () => {
  console.log('Some test failed.')
}, (test) => {
  console.log('Tests are done.')
})
