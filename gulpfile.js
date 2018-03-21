const fs = require('fs');
const path = require('path');

const ts = require('gulp-typescript');

const gulp = require('gulp');
const browserify = require('browserify');
const transform = require('vinyl-transform');
const gulpBrowser = require('gulp-browser');
const uglify = require('gulp-uglify');
const save = require('gulp-save');
const sourcemaps = require('gulp-sourcemaps');
const filter = require('gulp-filter');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const uglify_es = require('gulp-uglify-es').default;
const del = require('del');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const tsify = require("tsify");

const prettySize = require('prettysize');
const gzipSize = require('gzip-size');
const table = require('table');

const baseTsConfig = {
	"declaration": true,
	"sourceMap": true,
	"noImplicitAny": true,
	"removeComments": true,
}

const inFile = 'Emitter.ts'
const filterNames = ['*.js']
const outDir = 'dist'


function clean() {
	return del([ outDir ]);
}

function build_browser() {
  return gulp.src(inFile)
		.pipe(sourcemaps.init())

    // remove all exports to compile without module definition
    .pipe(replace(/export class/g, 'class'))
		.pipe(replace(/export interface/g, 'interface'))
		.pipe(replace(/export default\s/g, ''))

    // change defs to use browser optimizations
    .pipe(replace(/IF NOT BROWSER \*\//g, ''))
    .pipe(replace(/IF BROWSER/g, '*/'))

    .pipe(ts(Object.assign(baseTsConfig, {
			target: "es3",
			module: "none",
			declaration: false,
      // TODO: source maps doesn't match real file path, looks for ts file in dist dir
      // https://github.com/istanbuljs/nyc/issues/359
      rootDir: './', outDir
		})))

    .pipe(rename({suffix: '.es3'}))

    .pipe(save('compiled'))

    .pipe(rename({suffix: '.inlined'}))
    .pipe(sourcemaps.write('.', {destPath: outDir}))
    .pipe(gulp.dest(outDir))
    .pipe(filter(['**/*.js']))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(outDir))

    .pipe(save.restore('compiled'))

    .pipe(replace(/var Emitter = /g, 'window.Emitter = '))
    .pipe(rename({suffix: '.browser'}))
		.pipe(sourcemaps.write('.', {destPath: outDir}))
		.pipe(gulp.dest(outDir))
		.pipe(filter(['**/*.js']))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outDir))
}

function build_umd() {
  return gulp.src(inFile)
    .pipe(sourcemaps.init())

    // change defs to use browser optimizations
    .pipe(replace(/IF NOT BROWSER \*\//g, ''))
    .pipe(replace(/IF BROWSER/g, '*/'))

    .pipe(ts(Object.assign(baseTsConfig, {
      target: "es3",
      module: "umd",
      declaration: false
    })))

    .pipe(rename({suffix: '.es3.umd'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(outDir))
    .pipe(filter(['**/*.js']))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(outDir))
}


function build_node() {
	return gulp.src(inFile)
    .pipe(sourcemaps.init())
    .pipe(ts(Object.assign(baseTsConfig, {
			target: "es2015",
			module: "commonjs",
      declaration: true,
      //declarationDir: "./",
		})))

		//.pipe(rename({suffix: '.es3'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(outDir))

		.pipe(filter(['**/*.js']))
		.pipe(uglify_es())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outDir))

}

function build_es6() {
	return gulp.src(inFile)
		.pipe(sourcemaps.init())
    .pipe(ts(Object.assign(baseTsConfig, {
			target: "es2015",
			module: "es6",
      declaration: false,
		})))
  // $env:Path += ";"+ (Get-Item -Path ".\" -Verbose).FullName +"\node_modules\.bin"
  // set PATH=%PATH%;%cd%\node_modules\.bin
  // export PATH=$PATH:$(pwd)/node_modules/.bin
		.pipe(rename({suffix: '.es6'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(outDir))

		.pipe(filter(['**/*.js']))
		.pipe(uglify_es())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outDir))
}

function build_browser_tests() {

  let browserified = transform(function(filename) {
    console.log('-------------------------------', filename)
    let b = browserify({
      debug: true,
      //entries: ['test/Emitter.spec.ts'],
      cache: {},
      packageCache: {}
    })
      .add([filename])
      // .add(['test/Emitter.spec.ts'])
      /*.plugin(tsify, Object.assign(baseTsConfig, {
        target: "es3",
        module: "none",
        declaration: false
      }))*/
      .bundle()
    console.log('------------------------------- bundleed')
    return b

  });

  return gulp.src(['test/Emitter.spec.ts'])
    /*.pipe( replace(
      'import Emitter from \'../Emitter\';',
      'var emt = require("../dist/emitter.es3.min.js")'
    ))*/
    //.pipe(gulpBrowser.browserify(transforms))
    .pipe(browserified)
    //.pipe(source('output.js'))
    //.pipe(buffer())
    .pipe(gulp.dest("test/dist"));
}

function report(cb) {
	let data = [['Name', 'Bytes', 'Gzip', ' %']],
		config = { columns: {
			0: {alignment: 'left'},
			1: {alignment: 'right'},
			2: {alignment: 'right'}
		}, drawHorizontalLine: (i, s) => i<2||i===s };
	fs.readdirSync(outDir)
		.filter(name => name.match(/\.js$/))
		.forEach(name => {
			let fullPath = path.resolve(__dirname, outDir, name)
			let size, gzip, stats = fs.lstatSync(fullPath)
			data.push([
				name,
				size = stats.size,
				//prettySize(stats.size, {one: true/*, places: 2*/}),
        gzip = gzipSize.sync(fs.readFileSync(fullPath, 'utf8')),
				//prettySize(gzipSize.sync(fs.readFileSync(fullPath, 'utf8')), {one: true/*, places: 2*/})
        (100*gzip/size >> 0) + '%'
			])
		})
	setTimeout(() => {
		console.log(table.table(data, config))
	}, 100)
	cb && cb()
}

gulp.task('build_browser_tests', build_browser_tests);

let dist = gulp.series(
  clean,
  build_browser,
  build_umd,
  build_node,
  build_es6,
  //build_browser_tests,
  report
);
gulp.task('dist', dist);

gulp.task('default', dist);
