var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

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
    'css/**/*.*',
    'bower_components/**/*.*',
    'images/**/*.*',
    'scenes/**/*.js',
    'templates/**/*.js',
    'js/**/*.js',
    './lodash*.*',
    './*.*',
    '!./gulpfile.*',
    '!./bower.*',
    '!./package.json',
    '!./dist/**/*',
    '!./.git/**/*',
    '!./.jscsrc',
  ],
  ['production']
);
});

gulp.task('production', function () {

  gulp.src([
    'css/**/*.css',
  ], {
    base: '.',
  })
  .pipe(cleanCSS())
  .pipe(gulp.dest('dist/'));

  gulp.src([
    '!./background.js',
    '!./gulpfile.js',
    '!./lodash*.*',
    '!./xml2json*.*',
    './templates/**/*.js',
    './*.js',
    './js/**/*.js',
    '!./server/**/*.*',
    './scenes/**/*.js',
  ])
  .pipe(concat('javascript.js'))
  .pipe(gulp.dest('dist/'));

  gulp.src([
    './bower_components/**/*.*',
    './popup.html',
    './lodash.templates.js',
    './sweetalert.min.js',
    './xml2json.min.js',
    './background.js',
    './css/**/*.*',
    './*.json',
    '!./package.json',
    '!./bower.json',
    '!./css/**/*.css',
  ], {
    base: '.',
  })
  .pipe(gulp.dest('dist/'));
});
