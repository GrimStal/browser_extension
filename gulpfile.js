var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('styles', function() {
  gulp.src('./scss/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./css'));
});

gulp.task('server-styles', function() {
  gulp.src('./server/scss/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./server/public/css'));
});

gulp.task('styles:watch', function() {
  gulp.watch('./scss/**/*.scss', ['styles']);
  gulp.watch('./server/scss/**/*.scss', ['server-styles']);
});

gulp.task('production:watch', function() {
  gulp.watch([
        'css/**/*.*',
        'bower_components/**/*.*',
        'images/**/*.*',
        'scenes/**/*.js',
        'templates/**/*.js',
        'js/**/*.js',
        'background/**/*.js',
        './lodash*.*',
        './*.*',
        '!./gulpfile.*',
        '!./bower.*',
        '!./package.json',
        '!./dist/**/*',
        '!./.git/**/*',
        '!./.jscsrc',
        '!./server/**/*.*',
      ],
      ['production']
  );
});

gulp.task('production', function() {

  gulp.src(
      ['css/**/*.css'], {base: '.'})
      .pipe(cleanCSS())
      .pipe(gulp.dest('dist/'));

  gulp.src([
    '!./server/**/*.*',
    '!./gulpfile.js',
    '!./lodash*.*',
    '!./xml2json*.*',
    '!./jquery*.*',
    '!./sweetalert*.*',
    '!./SM.js',
    './templates/**/*.js',
    './*.js',
    './js/**/*.js',
    './scenes/**/*.js',
  ])
      .pipe(concat('javascript.js'))
      .pipe(gulp.dest('dist/'));

  gulp.src([
    './background/functions.js',
    './background/objects.js',
    './background/cargolt.js',
    './background/**/*.js',
  ])
      .pipe(concat('background.js'))
      .pipe(gulp.dest('dist/'));

  gulp.src([
    './popup.html',
    './lodash.templates.js',
    './SM.js',
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
    './bower_components/firebase/**/firebase-app.*',
    './bower_components/firebase/**/firebase-messaging.*'
  ], {
    base: './bower_components/',
  })
      .pipe(gulp.dest('dist/src/'));

  gulp.src([
    './sweetalert.min.js',
    './xml2json.min.js',
    './jquery.ba-jqmq.min.js',
    './firebase.js'
  ], {
    base: './',
  })
      .pipe(gulp.dest('dist/src/'));
});
