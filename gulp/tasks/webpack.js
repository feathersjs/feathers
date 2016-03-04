var gulp = require('gulp');
var config = require('../config').webpack;
var webpack = require('webpack-stream');

gulp.task('webpack', function () {
  gulp.src(config.src)
    .pipe(webpack(config), function(err, stats) {
      if (err) {
        throw new gutil.PluginError('[webpack]', err);
      }

      gutil.log('[webpack]', stats.toString({colors: true}));
      callback();
    })
    .pipe(gulp.dest(config.dest));
});