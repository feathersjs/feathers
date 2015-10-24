/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('assert');
var exec = require('child_process').exec;
var helpers = require('yeoman-generator').test;

describe('feathers-plugin generator', function () {
    it('created a plugin with passing tests', function (done) {
      var tmpDir;

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
         description: 'Plugin description here'
       })
       .on('end', function () {
         var child = exec('npm test', {
           cwd: tmpDir
         });

         child.on('exit', function (status) {
           assert.equal(status, 0, 'Got correct exist status');
           done();
         });
       });
    });
});
