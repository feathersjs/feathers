'use strict';

const assert = require('assert');
const request = require('request');
const app = require('../src/app');

describe('Feathers application tests', () => {
  before(function(done) {
    this.server = app.listen(3030);
    this.server.once('listening', () => done());
  });

  after(function(done) {
    this.server.close(done);
  });

  it('starts and shows the index page', done => {
    request('http://localhost:3030', (err, res, body) => {
      assert.ok(body.indexOf('<html>') !== -1);
      done(err);
    });
  });

  describe('404', () => {
    it('shows a 404 HTML page', done => {
      request({
        url: 'http://localhost:3030/path/to/nowhere',
        headers: {
          'Accept': 'text/html'
        }
      }, (err, res, body) => {
        assert.equal(res.statusCode, 404);
        assert.ok(body.indexOf('<html>') !== -1);
        done(err);
      });
    });

    it('shows a 404 JSON error without stack trace', done => {
      request({
        url: 'http://localhost:3030/path/to/nowhere',
        json: true
      }, (err, res, body) => {
        assert.equal(res.statusCode, 404);
        assert.equal(body.code, 404);
        assert.equal(body.message, 'Page not found');
        assert.equal(body.name, 'NotFound');
        done(err);
      });
    });
  });
});
