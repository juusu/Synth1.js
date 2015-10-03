var gulp = require('gulp'),
    include = require('gulp-include')
    compress = require('gulp-yuicompressor');

gulp.task('default', function() {
  gulp.src('main.js')
  	.pipe(include())
  		.on('error', console.log)
  	.pipe(gulp.dest("build"))
  	.pipe(compress({
  		type: 'js'
  	}))
  	.pipe(gulp.dest("minified"));
});