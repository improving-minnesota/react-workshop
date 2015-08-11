var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var jade = require('gulp-jade');
var livereload = require('gulp-livereload');
var connect = require('connect');
var redirect = require('connect-redirection');

gulp.task('clean', function () {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

gulp.task('less', function () {
  return gulp.src([
    'src/assets/less/style.less',
    'src/assets/less/pdf.less'
  ])
    .pipe(less({
      paths: ['src/assets/less']
    }))
    .pipe(gulp.dest('dist/temp'));
});

gulp.task('concat:css', ['less'], function() {
  return gulp.src([
      'src/assets/js/components/highlight.js/styles/zenburn.css',
      'dist/temp/style.css'
    ])
    .pipe(concat('style.css'))
    .pipe(gulp.dest('dist/temp'));
});

gulp.task('cssmin', ['concat:css'], function () {
  return gulp.src('dist/temp/**/*.css')
    .pipe(cssmin())
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(livereload());
});

gulp.task('concat:js', function() {
  return gulp.src([
    // Reveal.js
    'src/assets/js/components/headjs/dist/head.js',
    'src/assets/js/components/reveal.js/js/reveal.js',
    'src/assets/js/components/reveal.js/lib/js/classList.js',

    // Reveal.js Plugins
    'src/assets/js/components/reveal.js/plugin/markdown/marked.js',
    'src/assets/js/components/reveal.js/plugin/markdown/markdown.js',
    'src/assets/js/components/highlight.js/highlight.pack.js',
    'src/assets/js/components/reveal.js/plugin/zoom-js/zoom.js',

    //Presentation init
    'src/js/reveal.init.js'
  ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/temp'));
});

gulp.task('uglify', ['concat:js'], function() {
  return gulp.src('dist/temp/app.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(livereload());
});

gulp.task('jade', function() {
  return gulp.src('src/views/**/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
});

gulp.task('copy:fonts', function() {
  return gulp.src([
    'src/assets/js/components/reveal.js/lib/font/**',
    'src/assets/js/components/font-awesome/fonts/**'
  ])
    .pipe(gulp.dest('dist/assets/font'))
    .pipe(livereload());
});

gulp.task('copy:assets', function() {
  return gulp.src('src/assets/img/**')
    .pipe(gulp.dest('dist/assets/img'))
    .pipe(livereload());
});

gulp.task('connect', function(cb) {
  connect()
    .use(redirect())
    .use(function(req, res, next) {
      if (req.url == '/') {
        res.redirect('/react-workshop');
      } else {
        next();
      }
    })
    .use('/react-workshop', connect.static('dist'))
    .listen(8001);
    cb();
});

gulp.task('copy', ['copy:fonts','copy:assets']);

gulp.task('assemble', ['copy', 'jade', 'uglify', 'cssmin']);

gulp.task('watch', ['assemble', 'connect'], function() {
  // livereload.listen({
  //   port: 45678
  // });
  gulp.watch([
    'src/assets/js/components/reveal.js/lib/font/**',
    'src/assets/js/components/font-awesome/fonts/**',
    'src/assets/img/**'
  ], ['copy']);
  gulp.watch('src/assets/less/**/*.less', ['cssmin']);
  gulp.watch('src/views/**/*.jade', ['jade']);
  gulp.watch('src/assets/js/components/**/*.js', ['uglify']);
});

gulp.task('default', ['watch']);
