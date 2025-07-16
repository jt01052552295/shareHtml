const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulpSass = require('gulp-sass');
const dartSass = require('sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const fs = require('fs');
const dotenv = require('dotenv');
const isDev = process.env.NODE_ENV === 'development';

if (isDev && fs.existsSync('.env.development')) {
  dotenv.config({ path: '.env.development' });
  console.log('✅ 환경: development (.env.development 적용됨)');
} else {
  dotenv.config({ path: '.env' });
  console.log('✅ 환경: production (.env 적용됨)');
}

const basePath = process.env.BASE_URL || '';

const sass = gulpSass(dartSass);
const { src, dest, watch, series, parallel } = gulp;

// 이미지 경로 설정 (로컬 또는 CDN)
const assetsPath = '/assets/images'; // 로컬 이미지 경로

// 경로 설정
const paths = {
  html: {
    src: ['src/**/*.html', '!src/partials/**'],
    watch: ['src/**/*.html', 'src/partials/**/*.html'],
    dest: 'dist'
  },
  css: {
    src: 'src/assets/css/**/*.css',
    dest: 'dist/assets/css'
  },
  scss: {
    src: 'src/assets/scss/**/*.scss',
    dest: 'dist/assets/css'
  },
  js: {
    src: 'src/assets/js/**/*.js',
    dest: 'dist/assets/js'
  },
  img: {
    src: 'src/assets/images/**/*',
    dest: 'dist/assets/images'
  },
  static: {
    src: [
      'src/**/*',
      '!src/**/*.html',
      '!src/partials/**',
      '!src/assets/scss/**',
      '!src/assets/js/**',
      '!src/assets/css/**'
    ]
  }
};

// 공통 템플릿 변수
const templateData = {
  baseUrl: basePath.endsWith('/') ? basePath : basePath + '/',
  version: '1.0.0',
  cssPath: (basePath + '/assets/css').replace(/\/{2,}/g, '/'),
  jsPath: (basePath + '/assets/js').replace(/\/{2,}/g, '/'),
  imgPath: (basePath + '/assets/images').replace(/\/{2,}/g, '/')
};

// dist 폴더 삭제
function clean(done) {
  del.sync(['dist']);
  done(); // 작업 완료를 알림
}

// HTML 빌드 (file-include + 템플릿 변수)
function html() {
  return src(paths.html.src)
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file',
        context: templateData
      })
    )
    .pipe(replace('@@imgPath', assetsPath))
    .pipe(dest(paths.html.dest));
}

// CSS 복사 및 최적화
function css() {
  return src(paths.css.src)
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(dest(paths.css.dest))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest(paths.css.dest));
}

// SCSS 컴파일 및 최적화
function scss() {
  return src(paths.scss.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(dest(paths.scss.dest))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest(paths.scss.dest));
}

// JS 복사 및 최적화
function js() {
  return src(paths.js.src)
    .pipe(sourcemaps.init())
    .pipe(replace('@@imgPath', assetsPath))
    .pipe(dest(paths.js.dest))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest(paths.js.dest));
}

// 정적 파일 복사 (이미지 포함)
function copyStatic() {
  return src(paths.static.src).pipe(dest('dist'));
}

// 이미지만 별도 복사 (필요시)
function img() {
  return src(paths.img.src).pipe(dest(paths.img.dest));
}

// 브라우저 새로고침
function reload(done) {
  browserSync.reload();
  done();
}

// 개발 서버 실행 + watch
function serve() {
  browserSync.init({
    server: { baseDir: 'dist' },
    port: 4001,
    open: true
  });

  watch(paths.html.watch, series(html, reload));
  watch(paths.css.src, series(css, reload));
  watch(paths.scss.src, series(scss, reload));
  watch(paths.js.src, series(js, reload));
  watch(paths.img.src, series(img, reload));
}

// 전체 작업 정의
exports.default = series(clean, parallel(html, css, scss, js, copyStatic), serve);

// 빌드만 실행 (서버 실행 없이)
exports.build = series(clean, parallel(html, css, scss, js, copyStatic));
