var changed = require('gulp-changed');
var gulp = require('gulp');
var markdown = require('gulp-markdown');
var gulpif = require('gulp-if');
var frontMatter = require('gulp-front-matter');
var data = require('gulp-data');
var swigify = require('../util/swigify');
var sanitize = require('../util/sanitize');
var errorHandler = require('../util/error-handler');
var config = require('../config').pages;

gulp.task('pages', function() {
  return gulp.src(config.src)
    // .pipe(changed(config.dest)) // Ignore unchanged files
    .pipe(frontMatter(config.frontMatter))
    .pipe(gulpif(/\.md$/, markdown(config.markdown)))
    .pipe(data(sanitize(config.meta)))
    .pipe(swigify(config.swig).on('error', errorHandler))
    .pipe(gulp.dest(config.dest));
});