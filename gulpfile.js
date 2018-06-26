var
	gulp = require( 'gulp' ),
	browserSync = require( 'browser-sync' ),
	$ = require( 'gulp-load-plugins' )( {lazy: true} );

gulp.task( 'styles', function () {
	return gulp
		.src( './src/sass/**/*.scss' )
		.pipe( $.sass().on( 'error', $.sass.logError ) )
		.pipe( $.autoprefixer( 'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4' ) )
		.pipe( $.cleanCss() )
		.pipe( gulp.dest( 'dist/css' ) )
		.pipe( browserSync.reload( {stream: true} ) );
} );

gulp.task('vendorScripts', function() {
	gulp.src('./src/js/vendor/**/*.js')
			.pipe(gulp.dest('dist/js/vendor'));
});

gulp.task( 'scripts', function () {
	return gulp
		.src( [
			'./src/js/!(vendor)**/!(app)*.js',
			'./src/js/app.js'
		] )
		.pipe( $.plumber() )
		// .pipe( $.babel() )
		.pipe( $.concat( 'app.js' ) )
		// .pipe( $.uglify() )
		.pipe($.babili({
			mangle: {
				keepClassName: true
			}
		}))
		.pipe( gulp.dest( 'dist/js' ) )
		.pipe( browserSync.reload( {stream: true} ) );
} );

gulp.task( 'images', function () {
	return gulp
		.src( 'src/images/**' )
		.pipe( $.changed( 'images' ) )
		.pipe( $.imagemin( {
			progressive: true,
			interlaced: true
		} ) )
		.pipe( gulp.dest( 'dist/images' ) )
		.pipe( $.size( {title: 'images'} ) );
} );

gulp.task( 'html', function () {
	return gulp
		.src( './src/**/*.html' )
		.pipe( gulp.dest( 'dist/' ) )
} );

gulp.task( 'browser-sync', ['styles', 'scripts'], function () {
	browserSync( {
		server: {
			baseDir: "./dist/",
			injectChanges: true // this is new
		}
	} );
} );

gulp.task( 'deploy', function () {
	return gulp
		.src( './dist/**/*' )
		.pipe( ghPages() );
} );

gulp.task( 'watch', function () {

	gulp.watch( 'src/**/*.html', ['html', browserSync.reload] );
	gulp.watch( "dist/*.html" ).on( 'change', browserSync.reload );
	gulp.watch( 'src/sass/**/*.scss', ['styles', browserSync.reload] );
	gulp.watch( 'src/js/*.js', ['scripts', browserSync.reload] );
	gulp.watch( 'src/js/vendor/*', ['vendorScripts', browserSync.reload] );
	gulp.watch( 'src/images/**/*', ['images', browserSync.reload] );
} );

gulp.task( 'default', function () {
	gulp.start(
		'styles',
		'vendorScripts',
		'scripts',
		'images',
		'html',
		'browser-sync',
		'watch'
	);
} );
