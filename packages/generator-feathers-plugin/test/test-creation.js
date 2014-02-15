/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;


describe('feathers-plugin generator', function () {
    beforeEach(function (done) {
        helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
            if (err) {
                return done(err);
            }

            this.app = helpers.createGenerator('feathers-plugin:app', [
                '../../app'
            ]);
            done();
        }.bind(this));
    });

    it('creates expected files', function (done) {
        var expected = [
            // add files you expect to exist here.
            '.jshintrc',
            '.editorconfig',
            '.npmignore',
            'package.json',
            '.gitignore',
            '.jshintrc',
            'Gruntfile.js',
            '.travis.yml',
            'LICENSE',
            'README.md'
        ];

        helpers.mockPrompt(this.app, {
            'githubUser': 'Glavin001',
            'pluginName': 'plugin'
        });
        this.app.options['skip-install'] = true;
        this.app.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });
    });
});
