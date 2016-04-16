'use strict';

const assert = require('assert');
const path = require('path');
const helpers = require('yeoman-test');
const exec = require('child_process').exec;


describe('generator-feathers', function() {
  let appDir;

  function runTest(expectedText, done) {
    let child = exec('npm test', { cwd: appDir });
    let buffer = '';

    child.stdout.on('data', data => buffer += data);
    child.stderr.on('data', data => buffer += data);

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
      .inTmpDir(dir => appDir = dir)
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
      }).on('end', () => done());
  });

  it('feathers:app', function(done) {
    runTest('starts and shows the index page', done);
  });

  it('feathers:service(memory)', function(done) {
    helpers.run(path.join(__dirname, '../generators/service'))
      .inTmpDir(() => process.chdir(appDir))
      .withPrompts({
        type: 'database',
        database: 'memory',
        name: 'messages'
      })
      .on('end', () =>
        runTest('registered the messages service', done)
      );
  });

  it('feathers:service(generic)', function(done) {
    helpers.run(path.join(__dirname, '../generators/service'))
      .inTmpDir(() => process.chdir(appDir))
      .withPrompts({
        type: 'generic',
        name: 'tests'
      })
      .on('end', () =>
        runTest('registered the tests service', done)
      );
  });

  it('feathers:hook', function(done) {
    helpers.run(path.join(__dirname, '../generators/hook'))
      .inTmpDir(() => process.chdir(appDir))
      .withPrompts({
        type: 'before',
        service: 'messages',
        method: ['create', 'update', 'patch'],
        name: 'removeId'
      })
      .on('end', () =>
        runTest('hook can be used', done)
      );
  });
});
