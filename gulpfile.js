var gulp    = require('gulp');
var babel   = require('gulp-babel');
var riot    = require('gulp-riot');

gulp.task('babel', () => {
    gulp.src('./assets/js/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('public/js'))
});

gulp.task('riot', () => {
    gulp.src('./assets/template/**/*.pug')
        .pipe(riot({
            expr: true,
            type: 'babel',
            template: 'pug',
        }))
        .pipe(gulp.dest('public/template'))
});

gulp.task('watch', () => {
    gulp.watch(['./assets/js/**/*.js'], ['babel']);
    gulp.watch(['./assets/template/**/*.pug'], ['riot']);
});

gulp.task('default', [
    'babel',
    'riot',
    'watch',
]);

gulp.task('deploy', [
    'babel',
    'riot',
]);
