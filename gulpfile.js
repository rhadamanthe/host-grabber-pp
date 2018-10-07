// This file is in charge of the build process:
// Running tests, checking code quality, minifying the code, etc.

'use strict';

// Include gulp
var gulp = require('gulp');

// Include some of our plug-ins
var del = require('del');
var fs = require('fs');
var copy = require('gulp-copy');
var gutil = require('gulp-util');


// Clean all the output directories
gulp.task('clean', function( cb ) {
  del([ './build/firefox', './build/chrome' ], cb);
});


// Build Firefox
gulp.task('watch-dev', [ 'prepare-dev' ], function () {
  var watch = require('gulp-watch');
  var webserver = require('gulp-webserver');

  // Run a web server
  gulp.src('./target/dev').pipe( webserver());

  // Watch changes in our SRC directory and update the DEV one
  gulp.watch([ 'src/**/*', '_locales' ], [ 'prepare-watch-dev' ]);
});
