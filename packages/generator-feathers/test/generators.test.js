'use strict';

var assert = require('assert');
var path = require('path');
var helpers = require('yeoman-test');
var exec = require('child_process').exec;


describe('generator-feathers', function() {
  var appDir;

  function runTest(expectedText, done) {
    var child = exec('npm test', { cwd: appDir });
    var buffer = '';
    var addToBuffer = function(data) {
      buffer += data;
    };

    child.stdout.on('data', addToBuffer);
    child.stderr.on('data', addToBuffer);

    child.on('exit', function (status) {
      if(status !== 0) {
        return done(new Error(buffer));
      }
      
      assert.ok(buffer.indexOf(expectedText) !== -1,
        'Ran test with text: ' + expectedText);
      done();
    });
  }

  before(function(done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir(function(dir) {
        appDir = dir;
      })
      .withPrompts({
        name: 'myapp',
        providers: ['rest', 'socketio'],
        cors: 'whitelisted',
        database: 'memory',
        corsWhitelist: '',
        authentication: []
      })
      .withOptions({
        skipInstall: false
      }).on('end', function() {
        done();
      });
  });

  it('feathers:app', function(done) {
    runTest('starts and shows the index page', done);
  });

  it('feathers:service(memory)', function(done) {
    helpers.run(path.join(__dirname, '../generators/service'))
      .inTmpDir(function() {
        process.chdir(appDir);
      })
      .withPrompts({
        type: 'database',
        database: 'memory',
        name: 'messages'
      })
      .on('end', function() {
        runTest('registered the messages service', done);
      });
  });

  it('feathers:service(generic)', function(done) {
    helpers.run(path.join(__dirname, '../generators/service'))
      .inTmpDir(function() {
        process.chdir(appDir);
      })
      .withPrompts({
        type: 'generic',
        name: 'tests'
      })
      .on('end', function() {
        runTest('registered the tests service', done);
      });
  });

  it('feathers:hook', function(done) {
    helpers.run(path.join(__dirname, '../generators/hook'))
      .inTmpDir(function() {
        process.chdir(appDir);
      })
      .withPrompts({
        type: 'before',
        service: 'messages',
        method: ['create', 'update', 'patch'],
        name: 'removeId'
      })
      .on('end', function() {
        runTest('hook can be used', done);
      });
  });
});
