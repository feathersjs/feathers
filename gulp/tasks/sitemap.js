var gulp = require('gulp');
var sitemap = require('gulp-sitemap');
var config = require('../config').sitemap;

gulp.task('sitemap', function() {
  return gulp.src(config.src)
    .pipe(sitemap(config.sitemap))
    .pipe(gulp.dest(config.dest));
});