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
    '!./jquery*.*',
    '!./sweetalert*.*',
    './templates/**/*.js',
    './*.js',
    './js/**/*.js',
    './scenes/**/*.js',
  ])
  .pipe(concat('javascript.js'))
  .pipe(gulp.dest('dist/'));

  gulp.src([
    './popup.html',
    './lodash.templates.js',
    './background.js',
    './css/**/*.*',
    './*.json',
    '!./package.json',
    '!./bower.json',
  ], {
    base: '.',
  })
  .pipe(gulp.dest('dist/'));

  gulp.src([
    './bower_components/bootstrap/dist/**/*.*',
    './bower_components/jquery/dist/jquery.min.js',
    './bower_components/jquery-ui/themes/**/*.*',
    './bower_components/jquery-ui/jquery-ui.min.js',
    './bower_components/js-md5/build/**/*.*',
    './bower_components/lodash/dist/**/*.*',
  ], {
    base: './bower_components/',
  })
  .pipe(gulp.dest('dist/src/'));

  gulp.src([
    './sweetalert.min.js',
    './xml2json.min.js',
    './jquery.ba-jqmq.min.js',
  ], {
    base: './',
  })
  .pipe(gulp.dest('dist/src/'));
});
