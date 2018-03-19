var run = require('tape-run');
var browserify = require('browserify');

browserify(__dirname + '/phantom.js')
  .bundle()
  .pipe(run({
    browser: 'phantom'
  }))
  //.on('results', console.log)
  .pipe(process.stdout);
