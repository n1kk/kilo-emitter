const fs = require('fs-extra');
const path = require('path');
const pkg = require('./package.json');

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

const prettySize = require('prettysize');
const gzipSize = require('gzip-size');
const table = require('table');

const inFile = 'src/Emitter.ts'
const outDir = 'dist'

const baseTsConfig = require('./tsconfig')
const tsConfig = Object.assign( baseTsConfig.compilerOptions, {
  rootDir: './src/',
  outDir
})

function clean_dist() {
	return del([ outDir]);
}

function clean_docs() {
  return del([ 'docs', 'README.md' ]);
}

function build_browser() {
  return gulp.src(inFile)
		.pipe(sourcemaps.init())

    // remove all exports to compile without module definition
    .pipe(replace(/export class/g, 'class'))
		.pipe(replace(/export interface/g, 'interface'))
		.pipe(replace(/export default\s/g, ''))

    .pipe(save('precompiled'))

    .pipe(ts(Object.assign(tsConfig, {
			target: "es3",
			module: "none",
			declaration: false,
      // TODO: source maps doesn't match real file path, looks for ts file in dist dir
      // https://github.com/istanbuljs/nyc/issues/359
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

    .pipe(save.restore('precompiled'))

    .pipe(ts(Object.assign(tsConfig, {
      target: "es2015",
      module: "none",
      declaration: false,
      // TODO: source maps doesn't match real file path, looks for ts file in dist dir
      // https://github.com/istanbuljs/nyc/issues/359
    })))

    .pipe(rename({suffix: '.es6.inlined'}))
    .pipe(sourcemaps.write('.', {destPath: outDir}))
    .pipe(gulp.dest(outDir))
    .pipe(filter(['**/*.js']))
    .pipe(uglify_es())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(outDir))

}

function build_umd() {
  return gulp.src(inFile)
    .pipe(sourcemaps.init())

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

function size_report(cb) {
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

  fs.ensureDirSync(path.resolve(__dirname, 'logs'))
  fs.writeFileSync(path.resolve(__dirname, 'logs/sizereport.json'), JSON.stringify(data, null, '  '), 'utf8')

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

    fs.writeFileSync(path.resolve(__dirname, 'logs/sizereporttable.txt'), tbl, 'utf8')
  }, 200)

  // finish task and let gulp print it's size_report
  cb && cb()
}

function gen_readme() {
  let repl = (a, b) => g = g.pipe(replace(a, b))

  let g = gulp.src(['readme.template.md'])
    , tableToMD = (tbl) => {
    tbl.splice(1,0,tbl[0].map(_=>'---'))
    return tbl.map(row => row.join(' | ')).join('\n')
  }
    , remNL = text => text.replace(/\\n/g, '\n')

  // generate coverage table
  let cov = require(path.resolve(__dirname, 'coverage/coverage-summary.json'))
  let getCov = (type) => `${cov.total[type].pct}% (${cov.total[type].covered}/${cov.total[type].total})`
    covTable = [
      ['Type', 'Coverage'],
      ['Statements', getCov('statements')],
      ['Branches', getCov('branches')],
      ['Functions', getCov('functions')],
      ['Lines', getCov('lines')],
    ]
  repl("${CoverageTable}", tableToMD(covTable))

  // generate compiled size table
  let size = require(path.resolve(__dirname, 'logs/sizereport.json'))
  covTable = [['Name', 'Bytes', 'Gzip', '%']]
    .concat(size.map(f => [f.name, f.size, f.gzip, f.pct]))
  repl("${CompiledSizeTable}", tableToMD(covTable))

  // insert inlined_es3 minified version
  repl(/\${PackageName}/g, pkg.name)
  repl(/\${PackageBrowserFile}/g, pkg.browser)

  // insert inlined_es3 minified version
  let inlined_es3 = 'Emitter.es3.inlined.min.js'
  repl("${InlineES3CompiledCode}", fs.readFileSync(path.resolve(__dirname, 'dist', inlined_es3), 'utf8'))
  repl("${InlineES3CompiledSize}", size.filter(f => f.name === inlined_es3)[0].size)

  let inlined_es6 = 'Emitter.es6.inlined.min.js'
  repl("${InlineES6CompiledCode}", fs.readFileSync(path.resolve(__dirname, 'dist', inlined_es6), 'utf8'))
  repl("${InlineES6CompiledSize}", size.filter(f => f.name === inlined_es6)[0].size)

  // save as README.md
  return g.pipe(rename({basename: 'README'})).pipe(gulp.dest('./'))
}

gulp.task('readme', gen_readme);

let dist = gulp.series(
  clean_dist,
  build_browser,
  build_umd,
  build_node,
  build_es6,
  //build_browser_tests,
  size_report
);
gulp.task('dist', dist);

let all = gulp.series(
  dist,
  'readme',
);
gulp.task('all', all);

gulp.task('default', dist);
