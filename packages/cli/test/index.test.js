const assert = require('assert');
const { exec } = require('child_process');
const path = require('path');
const cli = require('../lib');

describe('@feathersjs/cli', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'function');
  });

  it('basic functionality', () => {
    assert.equal(typeof cli, 'function', 'It worked');
  });

  it('runs the program with `generate` argument', function (done) {
    this.timeout(5000);

    exec(`node ${path.join(__dirname, '../bin/feathers.js')} generate`, (err, stdout, stderr) => {
      assert.equal(err, null);
      assert.equal(stderr, '');
      assert.equal(stdout, '\n  Usage: feathers generate [type]\n\n\n' +
        '  Options:\n\n' +
        '    -V, --version  output the version number\n' +
        '    -h, --help     output usage information\n\n\n' +
        '  Commands:\n\n' +
        '    generate|g [type]  Run a generator. Type can be\n' +
        '    \t• app - Create a new Feathers application in the current folder\n' +
        '    \t• authentication - Set up authentication for the current application\n' +
        '    \t• connection - Initialize a new database connection\n' +
        '    \t• hook - Create a new hook\n' +
        '    \t• middleware - Create an Express middleware\n' +
        '    \t• secret - Generate a new authentication secret\n' +
        '    \t• service - Generate a new service\n' +
        '    \t• plugin - Create a new Feathers plugin\n' +
        '    \n    upgrade|u          Try to automatically upgrade to the latest Feathers version\n' +
        '    *                \n');

      done();
    });
  });
});
