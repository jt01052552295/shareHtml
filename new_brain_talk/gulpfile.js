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
const path = require('path');
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
    src: ['src/**/*.html', '!src/include/**'],
    watch: ['src/**/*.html', 'src/include/**/*.html'],
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
      '!src/include/**',
      '!src/assets/scss/**',
      '!src/assets/js/**',
      '!src/assets/css/**'
    ]
  }
};

// 공통 템플릿 변수
const templateData = {
  baseUrl: basePath.replace(/\/$/, ''),
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

// 파일 목록 생성 (link.html)
function makeFileList(done) {
  const startPath = 'src';
  let fileList = [];

  function walkDir(dir, relativePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (file !== 'include' && file !== 'assets' && file !== 'fonts') { // 제외할 폴더
             walkDir(filePath, path.join(relativePath, file));
        }
      } else {
        if (file.endsWith('.html') && file !== 'link.html') { // link.html 제외
           fileList.push(path.join(relativePath, file).replace(/\\/g, '/'));
        }
      }
    });
  }

  try {
    walkDir(startPath);
  } catch (e) {
    console.error('파일 목록 생성 중 오류:', e);
  }

  const listHtml = fileList.map(f => {
      return `
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <a href="${f}" target="_blank" class="card h-100 text-decoration-none text-dark shadow-sm hover-shadow transition">
            <div class="card-body d-flex align-items-center">
                <span class="badge bg-primary me-2">PAGE</span>
                <span class="text-truncate w-100" title="${f}">${f}</span>
            </div>
        </a>
      </div>`;
  }).join('\n');

  const template = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>퍼블리싱 파일 목록</title>
    <link rel="stylesheet" href="${templateData.cssPath}/bootstrap.min.css" />
    <link rel="stylesheet" href="${templateData.cssPath}/style.css">
    <style>
        .hover-shadow:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; transform: translateY(-2px); }
        .transition { transition: all 0.2s; }
    </style>
</head>
<body>
<main class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h1 class="h3 m-0">퍼블리싱 파일 목록</h1>
        <span class="badge bg-secondary">${fileList.length} files</span>
    </div>
    <div class="row">
        ${listHtml}
    </div>
</main>
</body>
</html>`;

  fs.writeFileSync('src/link.html', template);
  console.log('✅ src/link.html 파일 목록 생성 완료');
  done();
}

// HTML 빌드 (file-include + 템플릿 변수)
function html() {
  return src(paths.html.src)
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: 'src',
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
exports.default = series(clean, makeFileList, parallel(html, css, scss, js, copyStatic), serve);

// 빌드만 실행 (서버 실행 없이)
exports.build = series(clean, makeFileList, parallel(html, css, scss, js, copyStatic));
