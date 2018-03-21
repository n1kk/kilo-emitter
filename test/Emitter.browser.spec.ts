// import browser version of emitter to run tests against global window definition
let emt = require('../dist/emitter.es3.browser.js')
// import test suit
import test from "./Emitter.test.base";
// run tests
// have to use any here because Window doesn't have Emitter property in ts
test((<any>window).Emitter)

