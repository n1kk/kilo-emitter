const { Emitter } = require('../dist/emitter.js')
const testBase = require('./tape.base');

testBase(window.Emitter, () => {
  console.log('Some test failed.')
}, (test) => {
  console.log('Tests are done.')
})
