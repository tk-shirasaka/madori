var gulp = require('gulp');
var babel   = require('gulp-babel');

gulp.task('babel', () => {
    gulp.src('./assets/js/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('public/js'))
});

gulp.task('watch', () => {
    gulp.watch(['./assets/js/**/*.js'], ['babel']);
});

gulp.task('default', [
    'babel',
    'watch',
]);

gulp.task('deploy', [
    'babel',
]);
