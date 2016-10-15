/* global describe, it*/
'use strict';

var path = require('path');
var assert = require('assert');
var fs = require('fs');
var exec = require('child_process').exec;
var helpers = require('yeoman-test');

describe('feathers-plugin generator', function () {
  it('created a plugin with passing tests', function (done) {
    var tmpDir;

    helpers.run(path.join(__dirname, '../app'))
      .inTmpDir(function(dir) {
        tmpDir = dir;
      })
      .withOptions({
        skipInstall: false
      })
      .withPrompts({
        name: 'feathers-tmp',
        repository: 'feathersjs/feathers-tmp',
        description: 'Plugin description here'
      })
      .on('end', function () {
        assert.ok(fs.existsSync(path.join(tmpDir, '.npmignore')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.gitignore')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.travis.yml')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.editorconfig')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.babelrc')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.istanbul.yml')));
        assert.ok(fs.existsSync(path.join(tmpDir, 'package.json')));
        assert.ok(fs.existsSync(path.join(tmpDir, 'src', 'index.js')));
        assert.ok(fs.existsSync(path.join(tmpDir, 'test', 'index.test.js')));

        var child = exec('npm run compile && npm run mocha', {
          cwd: tmpDir
        });
        var buffer = '';

        child.stdout.on('data', function(data) {
          buffer += data.toString();
        });

        child.stderr.on('data', function(data) {
          buffer += data.toString();
        });

        child.on('exit', function (status) {
          if(status !== 0) {
            return done(new Error(buffer));
          }

          done();
        });
      });
  });
});
