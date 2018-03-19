console.log('in Phantom');

function abdFileUrl(path) {
  var absPath = fs.absolute(path)
  return 'file://' + (absPath[0] !== '/' ? '/' : '' ) + absPath
}

var page = require('webpage').create()
  , fs = require('fs')
  //file:///C://Full/Path/To/test.html
  // address = fileUrl(path.resolve(__dirname, 'browser.html'))
  , absPath_html = abdFileUrl("./phantom.html")

console.log('address? ' + absPath_html);
console.log('isFile? ' + fs.isFile(absPath_html));
console.log('isReadable? ' + fs.isReadable(absPath_html));

page.onError = function (msg, trace) {
  console.log(msg);
  trace.forEach(function(item) {
    console.log('  ', item.file, ':', item.line);
  });
};

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.onResourceRequested = function(request) {
  console.log('Request ' + JSON.stringify(request, undefined, 4));
};
page.onResourceReceived = function(response) {
  console.log('Receive ' + JSON.stringify(response, undefined, 4));
};

page.open(absPath_html, function(status){
  console.log('status? ' + status);
  console.log(page.content)
  //phantom.exit();
});
// phantom.exit();
