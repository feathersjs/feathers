/* global describe, it */
'use strict';

const path = require('path');
const assert = require('assert');
const fs = require('fs');
const { exec } = require('child_process');
const helpers = require('yeoman-test');

describe('feathers-plugin generator', function () {
  this.timeout(180000);

  it('created a plugin with passing tests', done => {
    let tmpDir;

    helpers.run(path.join(__dirname, '../app'))
      .inTmpDir(function (dir) {
        tmpDir = dir;
      })
      .withOptions({
        skipInstall: false
      })
      .withPrompts({
        name: 'feathers-tmp',
        repository: 'feathersjs/feathers-tmp',
        description: 'Plugin description here',
        client: false
      })
      .on('end', function () {
        assert.ok(fs.existsSync(path.join(tmpDir, '.npmignore')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.gitignore')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.travis.yml')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.editorconfig')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.istanbul.yml')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.github', 'contributing.md')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.github', 'issue_template.md')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.github', 'pull_request_template.md')));
        assert.ok(fs.existsSync(path.join(tmpDir, 'package.json')));
        assert.ok(fs.existsSync(path.join(tmpDir, 'mocha.opts')));
        assert.ok(fs.existsSync(path.join(tmpDir, 'lib', 'index.js')));
        assert.ok(fs.existsSync(path.join(tmpDir, 'test', 'index.test.js')));

        const child = exec('npm test', {
          cwd: tmpDir
        });

        let buffer = '';

        child.stdout.on('data', data => {
          buffer += data.toString();
        });
        child.stderr.on('data', data => {
          buffer += data.toString();
        });

        child.on('exit', status => {
          if (status !== 0) {
            return done(new Error(buffer));
          }

          done();
        });
      });
  });
});
