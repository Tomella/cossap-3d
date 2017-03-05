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
var gulpTs           = require('gulp-typescript');
var tslint           = require("gulp-tslint");
var uglify           = require('gulp-uglify');


var ASSETS_BASE = "dist";
var RESOURCES_BASE = 'dist/resources';

gulp.task('definitions', ['buildDefinitions'], function() {
   return gulp.src('./dist/definitions/**/*.ts')
    .pipe(concat('index.d.ts'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('buildDefinitions', function() {
    var tsResult = gulp.src('source/**/*.ts')
        .pipe(gulpTs({
         "target": "es6",
         "declaration": true
    }));

    return tsResult.dts.pipe(gulp.dest('dist/definitions'));
});

gulp.task('workers', function () {
   return gulp.src('./source/workers/*.js')
      .pipe(gulp.dest("dist/workers"));
});

gulp.task('libs', function() {
  return rollup({
      entry: './source/libs.ts',
      plugins: [
         rollupTypescript({typescript:ts})
      ],
		format: 'umd',
		moduleName: 'Explorer3d',
    })
    .pipe(source('libs.js'))
    .pipe(header(fs.readFileSync('./source/polyfills.js', 'utf8')))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', function() {
  return rollup({
      entry: './source/explorer3d.ts',
      plugins: [
         rollupTypescript({typescript:ts})
      ],
		format: 'umd',
		moduleName: 'Explorer3d',
    })
    .pipe(source('explorer3d.js'))
    .pipe(header(fs.readFileSync('./build/dependencies.js', 'utf8')))
    .pipe(gulp.dest('./dist'));
});

gulp.task('dependencies', function() {
  return gulp.src(["./resources/dependencies/*.js", "./source/polyfills.js"])
      .pipe(concat('dependencies.js'))
      .pipe(header("// WARNING: Don't edit.\n// This file contains all the content from the dependencies directory. It's rolled up into the explorer3d.js file.\n\n"))
      .pipe(gulp.dest('./build'));
});

gulp.task('dist', ['build', 'libs', 'workers'], function () {
   return gulp.src(['dist/*.js', '!dist/*.min.js'])
      .pipe(uglify())
      .pipe(rename({
         extname: '.min.js'
      }))
      .pipe(gulp.dest('dist'));
});

gulp.task('resources', function () {
   // Polyfills gets rolled up in the larger files. The others are optional.
   return gulp.src(['resources/**/*.*', "!resources/dependencies/*"])
      .pipe(gulp.dest(RESOURCES_BASE));
});

gulp.task('examples',  ['dist', 'resources']); //['build', 'libs', 'workers', 'resources']);

gulp.task("tslint", function() {
    return gulp.src("source/**/*.ts")
        .pipe(tslint())
        .pipe(tslint.report({
            emitError: false
        }));
});

// Watch Files For Changes
gulp.task('watch', function () {
   // We'll watch JS, SCSS and HTML files.
   gulp.watch('source/**/*.ts', ['tslint']);
   gulp.watch(['source/**/*.js', 'source/**/*.ts'], ['examples']);
});

gulp.task('clean', function (cb) {
   return del(["dist", "build"], cb);
});


// We clean, package up the little dependencies and then we are ready to rock and roll.
// Note that if new dependencies are added you need run the default task to repackage everything.
// We don't watch dependencies or expect them to change between gulp restarts.
gulp.task('default', function(callback) {
  return runSequence('clean', 'dependencies', ['examples', 'tslint', 'watch']);
});