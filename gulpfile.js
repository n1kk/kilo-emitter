const fs = require('fs');
const path = require('path');

const ts = require('gulp-typescript');

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const save = require('gulp-save');
const sourcemaps = require('gulp-sourcemaps');
const filter = require('gulp-filter');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const uglify_es = require('gulp-uglify-es').default;
const del = require('del');
const typedoc = require("gulp-typedoc");

const prettySize = require('prettysize');
const gzipSize = require('gzip-size');
const table = require('table');

const inFile = 'Emitter.ts'
const outDir = 'dist'

const baseTsConfig = require('./tsconfig')
const tsConfig = Object.assign( baseTsConfig.compilerOptions, {
  rootDir: './',
  outDir
})

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

    .pipe(ts(Object.assign(tsConfig, {
			target: "es3",
			module: "none",
			declaration: false,
      // TODO: source maps doesn't match real file path, looks for ts file in dist dir
      // https://github.com/istanbuljs/nyc/issues/359
      rootDir: './',
      outDir
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

    .pipe(ts(Object.assign(tsConfig, {
      target: "es3",
      module: "umd",
      declaration: false
    })))

    .pipe(rename({suffix: '.es3.umd'}))
    .pipe(sourcemaps.write('.', {destPath: outDir}))
    .pipe(gulp.dest(outDir))
    .pipe(filter(['**/*.js']))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(outDir))
}


function build_node() {
	return gulp.src(inFile)
    .pipe(sourcemaps.init())
    .pipe(ts(Object.assign(tsConfig, {
			target: "es2015",
			module: "commonjs",
      declaration: true,
      //declarationDir: "./",
		})))

		//.pipe(rename({suffix: '.es3'}))
		.pipe(sourcemaps.write('.', {destPath: outDir}))
		.pipe(gulp.dest(outDir))

		.pipe(filter(['**/*.js']))
		.pipe(uglify_es())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outDir))

}

function build_es6() {
	return gulp.src(inFile)
		.pipe(sourcemaps.init())
    .pipe(ts(Object.assign(tsConfig, {
			target: "es2015",
			module: "es6",
      declaration: false,
		})))
  // $env:Path += ";"+ (Get-Item -Path ".\" -Verbose).FullName +"\node_modules\.bin"
  // set PATH=%PATH%;%cd%\node_modules\.bin
  // export PATH=$PATH:$(pwd)/node_modules/.bin
		.pipe(rename({suffix: '.es6'}))
		.pipe(sourcemaps.write('.', {destPath: outDir}))
		.pipe(gulp.dest(outDir))

		.pipe(filter(['**/*.js']))
		.pipe(uglify_es())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outDir))
}

function gen_docs() {
  return gulp
    .src([inFile])
    .pipe(typedoc(Object.assign(tsConfig, {
      // TypeScript options (see typescript docs)
      target: "es2015",
      module: "es6",
      declaration: false,

      // Output options (see typedoc docs)
      out: "./docs",
      json: "./docs/docs.json",

      // TypeDoc options (see typedoc docs)
      name: "kilo-emitter",
      theme: "minimal",
      //plugins: ["my", "plugins"],
      ignoreCompilerErrors: false,
      version: true,
    })))
}

function report(cb) {
	let data = []
	fs.readdirSync(outDir)
		.filter(name => name.match(/\.js$/))
		.forEach(name => {
			let fullPath = path.resolve(__dirname, outDir, name)
			let stats = fs.lstatSync(fullPath)
        , size = stats.size
      //prettySize(stats.size, {one: true/*, places: 2*/})
        , gzip = gzipSize.sync(fs.readFileSync(fullPath, 'utf8'))
      //prettySize(gzipSize.sync(fs.readFileSync(fullPath, 'utf8')), {one: true/*, places: 2*/})
        , pct = (100 * gzip / size >> 0) + '%'
			data.push({name, size, gzip, pct})
		})

  // delay size report printing to have it after gulp finishes
	setTimeout(() => {
	  let tbl = table.table(
      /*DATA*/ [['Name', 'Bytes', 'Gzip', ' %']].concat(data.map(f => [f.name, f.size, f.gzip, f.pct])),
      /*CONFIG*/ {
        columns: {
          0: {alignment: 'left'},
          1: {alignment: 'right'},
          2: {alignment: 'right'}
        }, drawHorizontalLine: (i, s) => i < 2 || i === s
      }
    )
		console.log(tbl)
    fs.writeFileSync(path.resolve(__dirname, 'docs/sizereport.json'), JSON.stringify(data, null, '  '), 'utf8')
    fs.writeFileSync(path.resolve(__dirname, 'docs/sizereporttable.txt'), tbl, 'utf8')
	}, 100)

  // finish task and let gulp print it's report
	cb && cb()
}

gulp.task('gen_docs', gen_docs);

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
