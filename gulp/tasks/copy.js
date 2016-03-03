var changed = require('gulp-changed');
var gulp = require('gulp');
var config = require('../config').copy;

gulp.task('copy', function () {
  gulp.src(config.src)
    .pipe(gulp.dest(config.dest));
});