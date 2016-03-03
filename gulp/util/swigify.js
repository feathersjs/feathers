var path = require('path');
var through = require('through2');
var swig = require('swig');

module.exports = function(options){
  return through.obj(function(file, encoding, cb){
    var data = file.data;
    try {
      swig.setDefaults({cache: false});

      // Find template/page based on layout in front matter or use default layout
      var layout = (file.data.page.layout || options.defaultLayout) + options.extension;
      var layoutFile = path.join(options.layoutPath, layout);
      var template = swig.compileFile(layoutFile);
      
      file.contents = new Buffer(template(data), 'utf8');
      this.push(file);
      cb();
    }
    catch (error) {
      cb(error); 
    }
  });
};