'use strict';

const assert = require('assert');
const path = require('path');
const helpers = require('yeoman-generator').test;
const exec = require('child_process').exec;

function pipe(child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

describe('generator-feathers', () => {
  it('feathers:app', done => {
    let cwd;

    helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir(dir => cwd = dir)
      .withPrompts({
        name: 'myapp',
        providers: ['rest', 'socketio'],
        cors: 'enabled',
        database: 'nedb',
        authentication: []
      })
      .withOptions({
        skipInstall: false
      })
      .on('end', function () {
        const child = exec('npm test', { cwd });

        pipe(child);

        child.on('exit', function (status) {
          assert.equal(status, 0, 'Got correct exist status');
          done();
        });
      });
  });
});