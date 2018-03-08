const fs = require('fs');
const path = require('path');

const ts = require('gulp-typescript');

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const filter = require('gulp-filter');
const rename = require('gulp-rename');
const uglify_es = require('gulp-uglify-es').default;
const del = require('del');

const prettyBytes = require('pretty-bytes');
const gzipSize = require('gzip-size');
const table = require('table');


const baseTsConfig = {
	"declaration": true,
	"sourceMap": true,
	"noImplicitAny": true,
	"removeComments": true,
}

const inFile = 'emitter.ts'
const filterNames = ['*.js']
const outDir = 'dist'

function clean() {
	return del([ outDir ]);
}

function build_browser() {
	const f = filter(['**/*.js'], {restore: true});

	let code = fs.readFileSync(inFile, 'utf8')
	fs.writeFileSync('_' + inFile,
		code.replace('export ', '').replace('default ', ''),
		'utf8')

	let pipe = gulp.src('_' + inFile)
		.pipe(sourcemaps.init())
		.pipe(rename(inFile))
		.pipe(ts(Object.assign(baseTsConfig, {
			target: "es3",
			module: "none",
			declaration: false
		})))

		.pipe(rename({suffix: '.es3'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(outDir))

		.pipe(f)
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outDir))

	del('_' + inFile)

	return pipe
}

function build_node() {
	const f = filter(['**/*.js'], {restore: true});
	return gulp.src(inFile)
		.pipe(sourcemaps.init())
		.pipe(ts(Object.assign(baseTsConfig, {
			target: "es2015",
			module: "commonjs",
		})))

		//.pipe(rename({suffix: '.es3'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(outDir))

		.pipe(f)
		.pipe(uglify_es())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outDir))

}

function build_es6() {
	const f = filter(['**/*.js'], {restore: true});
	return gulp.src(inFile)
		.pipe(sourcemaps.init())
		.pipe(ts(Object.assign(baseTsConfig, {
			target: "es2015",
			module: "es6",
		})))

		.pipe(rename({suffix: '.es6'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(outDir))

		.pipe(f)
		.pipe(uglify_es())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outDir))
}

function report(cb) {
	let data = [['Name', 'Size', 'Gzip']],
		config = { columns: {
			0: {alignment: 'left'},
			1: {alignment: 'right'},
			2: {alignment: 'right'}
		}, drawHorizontalLine: (i, s) => i<2||i==s};
	fs.readdirSync(outDir)
		.filter(name => !name.match(/\.map|\.d\.ts/))
		.forEach(name => {
			let fullPath = path.resolve(__dirname, outDir, name)
			let stats = fs.lstatSync(fullPath)
			data.push([
				name,
				prettyBytes(stats.size),
				prettyBytes(gzipSize.sync(fs.readFileSync(fullPath, 'utf8')))
			])
		})
	setTimeout(() => {
		console.log(table.table(data, config))
	}, 100)
	cb && cb()
}

gulp.task('build_browser', build_browser);

let dist = gulp.series(clean, build_browser, build_node, build_es6, report);
gulp.task('dist', dist);

gulp.task('default', build_browser);