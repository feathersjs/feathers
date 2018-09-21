const jsdom = require('jsdom');
const baseTests = require('@feathersjs/commons/lib/test/client');

const app = require('../fixture');
const feathers = require('../../');

describe('jQuery REST connector', function () {
  const rest = feathers.rest('http://localhost:7676');
  const client = feathers();

  before(function (done) {
    this.server = app().listen(7676, function () {
      jsdom.env({
        html: '<html><body></body></html>',
        scripts: [
          'http://code.jquery.com/jquery-2.1.4.js'
        ],
        done: function (err, window) { // eslint-disable-line handle-callback-err
          window.jQuery.support.cors = true;
          client.configure(rest.jquery(window.jQuery));
          done();
        }
      });
    });
  });

  after(function () {
    this.server.close();
  });

  baseTests(client, 'todos');
});
