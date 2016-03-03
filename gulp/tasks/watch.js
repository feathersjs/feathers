var gulp = require('gulp');
var config = require('../config');
var path = require('path');

gulp.task('watch', function() {
  global.isWatching = true;
  // gulp.watch(config.server.src, ['server']);
  gulp.watch(config.copy.src, ['copy']);
  gulp.watch(path.resolve(__dirname, '../..', 'assets/layouts/**/*'), ['pages']);
  gulp.watch(config.pages.src, ['pages']);
  gulp.watch(config.scripts.src, ['webpack']);
  gulp.watch(config.fonts.src, ['fonts']);
  gulp.watch(config.images.src, ['images']);
  gulp.watch(config.less.src + '/**/*', ['less']);
});