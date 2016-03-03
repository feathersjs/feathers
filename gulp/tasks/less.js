var path = require('path');
var gulp = require('gulp');
var less = require('gulp-less');
var cssmin = require('gulp-minify-css');
var errorHandler = require('../util/error-handler');
var config = require('../config').less;

gulp.task('less', function () {
  gulp.src(path.join(config.src, config.entry))
    .pipe(less({
      paths: [ path.join(__dirname, config.src) ]
    }).on('error', errorHandler))
    // .pipe(cssmin())
    .pipe(gulp.dest(config.dest));
});