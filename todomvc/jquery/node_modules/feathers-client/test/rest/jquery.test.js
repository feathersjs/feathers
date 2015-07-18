var jsdom = require('jsdom');
var app = require('../resources/fixture');
var baseTests = require('../resources/base');
var jQueryService = require('../../lib/rest/jquery').Service;

describe('jQuery REST connector', function() {
  var service = jQueryService._create('todos', {
    base: 'http://localhost:7676'
  });

  before(function(done) {
    this.server = app().listen(7676, function() {
      jsdom.env({
        html: '<html><body></body></html>',
        scripts: [
          'http://code.jquery.com/jquery-2.1.4.js'
        ],
        done: function (err, window) {
          window.jQuery.support.cors = true;
          service.connection = window.jQuery;
          done();
        }
      });
    });
  });

  after(function(done) {
    this.server.close(done);
  });

  baseTests(service);
});
