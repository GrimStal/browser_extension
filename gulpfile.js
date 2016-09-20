var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function () {
  return gulp.src('./scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./css'));
});

gulp.task('styles:watch', function () {
  gulp.watch('./scss/**/*.scss', ['styles']);
});

gulp.task('production:watch', function () {
  gulp.watch([
    'css/**/*.css',
    'bower_components/**/*.*',
    'images/**/*.*',
    'scenes/**/*.js',
    'src/**/*.*',
    'templates/**/*.js',
    './*.*',
    '!./gulpfile.*',
    '!./bower.*',
    '!./lodash.templates.js',
    '!./package.json',
    '!./dist/**/*',
    '!./.git/**/*',
  ],
  ['production']
);
});

gulp.task('production', function () {
  gulp.src([
    'css/**/*.css',
    'bower_components/**/*.*',
    'images/**/*.*',
    'scenes/**/*.js',
    'src/**/*.*',
    'templates/**/*.js',
    './*.*',
    '!./gulpfile.*',
    '!./bower.*',
    '!./lodash.templates.js',
    '!./package.json',
    '!./dist/**/*',
    '!./.git/**/*',
  ], {
    base: '.',
  })
  .pipe(gulp.dest('dist/'));
});
