'use strict'

const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const connect = require('gulp-connect')
const copy = require('gulp-copy')
const postcss = require('gulp-postcss')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('autoprefixer')
const pixrem = require('pixrem')
const comments = require('postcss-discard-comments')
const cssnano = require('cssnano')
const nunjucks = require('gulp-nunjucks-render')
const rimraf = require('rimraf')

const paths = {
  here: './',
  src: 'src',
  dist: 'dist',
  html_path: './src/html',
  html_source: './src/html/**/*.njk',
  scss_source: './src/scss/**/*.scss',
  scss: './src/scss/main*'
}

function server() {
  connect.server({
    root: paths.dist,
    livereload: true
  })
}

function clean(cb) {
  return rimraf(paths.dist, cb)
}

function watch() {
  gulp.watch([paths.scss_source], scss)
  gulp.watch(['src/html/*njk'], nunjucksRender)
}

function nunjucksRender() {
  return gulp.src(paths.html_source)
    .pipe(nunjucks({
      path: paths.html_path
    }))
    .pipe(gulp.dest(paths.dist))
    .pipe(connect.reload())
}

function scss() {
  return gulp
    .src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([pixrem(),autoprefixer()]))
    .pipe(sourcemaps.write(paths.here))
    .pipe(gulp.dest(paths.dist+'/assets/css/'))
    .pipe(connect.reload())
}

function minifyScss() {
  return gulp.src(paths.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      pixrem(),
      autoprefixer(),
      comments({
        removeAll: true
      }),
      cssnano({
        safe: true
      })
    ]))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.dist + '/assets/css/'))
}

const dev = gulp.series(clean, gulp.parallel(nunjucksRender, scss, server, watch))
const build = gulp.series(clean, gulp.parallel(minifyScss))

exports.dev = dev
exports.build = build
