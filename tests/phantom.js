console.log('in Phantom');

/*var path = require('path');

function fileUrl(str) {
  if (typeof str !== 'string') {
    throw new Error('Expected a string');
  }

  var pathName = path.resolve(str).replace(/\\/g, '/');

  // Windows drive letter must be prefixed with a slash
  if (pathName[0] !== '/') {
    pathName = '/' + pathName;
  }

  return encodeURI('file://' + pathName);
}*/

var page = require('webpage').create()
  , fs = require('fs')
  //file:///C://Full/Path/To/test.html
  // address = fileUrl(path.resolve(__dirname, 'browser.html'))
  , absPath = fs.absolute("./browser.html")
  , address = 'file://' + (absPath[0] !== '/' ? '/' : '' ) + absPath

console.log('address? ' + address);
console.log('isFile? ' + fs.isFile(address));
console.log('isReadable? ' + fs.isReadable(address));
page.open(address, function(status){
  console.log('status? ' + status);
  console.log(page.content)
  //phantom.exit();
});
// phantom.exit();
