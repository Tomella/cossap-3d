var fs               = require('fs');
var concat           = require('gulp-concat');
var header           = require('gulp-header');
var buffer           = require('vinyl-buffer');
var del              = require('del');
var gulp             = require('gulp');
var rename           = require('gulp-rename');
var rollup           = require('rollup-stream');
var rollupTypescript = require('rollup-plugin-typescript');
var runSequence      = require('run-sequence');
var source           = require('vinyl-source-stream');
var sourcemaps       = require('gulp-sourcemaps');
var ts               = require('typescript');
var tslint           = require("gulp-tslint");
var uglify           = require('gulp-uglify');

var ASSETS_BASE = "dist";
var RESOURCES_BASE = 'dist/resources';

gulp.task('workers', function () {
   return gulp.src('./source/workers/*.js')
      .pipe(gulp.dest("dist/cossap3d/workers"));
});

gulp.task('build', ['workerlib'], function() {
  return rollup({
      entry: './source/cossap3d.ts',
      plugins: [
         rollupTypescript({typescript:ts})
      ],
		format: 'umd',
		moduleName: 'Cossap3d',
    })
    .pipe(source('cossap3d.js'))
    .pipe(gulp.dest('./dist/cossap3d'));
});

gulp.task('workerlib', function() {
  return rollup({
      entry: './source/workerlib.ts',
      plugins: [
         rollupTypescript({typescript:ts})
      ],
		format: 'umd',
		moduleName: 'Cossap3d',
    })
    .pipe(source('workerlib.js'))
    .pipe(gulp.dest('./dist/cossap3d'));
});


gulp.task('workers', function () {
   return gulp.src('./source/workers/**/*.js')
      .pipe(gulp.dest("dist/workers"));
});

gulp.task('dist', ['build'], function () {
   return gulp.src(['dist/*.js', '!dist/*.min.js'])
      .pipe(uglify())
      .pipe(rename({
         extname: '.min.js'
      }))
      .pipe(gulp.dest('dist'));
});

gulp.task('resources', function () {
   // Polyfills gets rolled up in the larger files. The others are optional.
   return gulp.src(['resources/**/*.*'])
      .pipe(gulp.dest(RESOURCES_BASE));
});

gulp.task('views', function () {
   // Polyfills gets rolled up in the larger files. The others are optional.
   return gulp.src(['views/**/*.*'])
      .pipe(gulp.dest(ASSETS_BASE));
});

gulp.task('start',  ['dist', 'resources']); //['build', 'libs', 'workers', 'resources']);

gulp.task("tslint", function() {
    return gulp.src("source/**/*.ts")
        .pipe(tslint())
        .pipe(tslint.report({
            emitError: false
        }));
});

gulp.task('concatCss', function () {
  return gulp.src('source/**/*.css')
    .pipe(concat("cossap3d.css"))
    .pipe(gulp.dest(ASSETS_BASE));
});

// Watch Files For Changes
gulp.task('watch', function () {
   // We'll watch JS, SCSS and HTML files.
   gulp.watch('source/**/*.ts', ['tslint']);
   gulp.watch('views/**/*', ['views']);
   gulp.watch(['source/workers/**/*.js'], ['workers']);
   gulp.watch(['source/**/*.js', 'source/**/*.ts'], ['dist']);
   gulp.watch('source/**/*.css', ['concatCss']);
});

gulp.task('clean', function (cb) {
   return del(["build"], cb);
});

// We clean, package up the little dependencies and then we are ready to rock and roll.
// Note that if new dependencies are added you need run the default task to repackage everything.
// We don't watch dependencies or expect them to change between gulp restarts.
gulp.task('default', function(callback) {
  return runSequence('clean', ['concatCss', 'tslint', 'watch', 'start']);
});