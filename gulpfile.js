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
    'css/**/*.css',
    'bower_components/**/*.*',
    'images/**/*.*',
    'scenes/**/*.js',
    'templates/**/*.js',
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
    'css/**/*.css'
  ], {
    base: '.',
  })
  .pipe(cleanCSS())
  .pipe(gulp.dest('dist/'));

  gulp.src([
    '!./background.js',
    '!./gulpfile.js',
    '!./lodash*.*',
    './templates/**/*.js',
    '!./server/**/*.*',
    './*.js',
    './scenes/**/*.js',
  ])
  .pipe(concat('javascript.js'))
  // .pipe(uglify())
  .pipe(gulp.dest('dist/'));

  gulp.src([
    './bower_components/**/*.*',
    './images/**/*.*',
    './popup.html',
    './lodash.templates.min.js',
    './background.js',
    './*.json',
    '!./package.json',
  ], {
    base: '.',
  })
  .pipe(gulp.dest('dist/'));
});
