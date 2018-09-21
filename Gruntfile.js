const server = require('./packages/client/test/server');

module.exports = function (grunt) {
  const browsers = [{
    browserName: 'firefox',
    platform: 'Windows 10'
  }, {
    browserName: 'googlechrome',
    platform: 'linux'
  }, {
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0'
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 8',
    version: '10'
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 10',
    version: '11'
  }];

  grunt.registerTask('server', 'Start the test server', function () {
    server.on('listening', () => {
      console.log('Test server listening on port 3000');
    });
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    server: {},

    'saucelabs-mocha': {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:3000/packages/client/browser/index.html'
          ],
          browsers: browsers,
          build: process.env.TRAVIS_JOB_ID,
          testname: 'feathers-client mocha tests',
          throttled: 1
        }
      }
    },
    watch: {}
  });

  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.registerTask('default', [ 'server', 'saucelabs-mocha' ]);
};
