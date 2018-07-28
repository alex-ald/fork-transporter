const gulp = require('gulp'),
  del = require('del');

gulp.task('clean:dist', function () {
  return del([
    'dist/'
  ]);
});

gulp.task('clean:coverage', function () {
  return del([
    'coverage/'
  ]);
});

gulp.task('clean', gulp.series('clean:dist'));