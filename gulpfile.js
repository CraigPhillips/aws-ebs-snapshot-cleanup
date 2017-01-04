/**
 *  Handles the construction of a deployable Lambda package
*/

var del = require("del"),
    gulp = require("gulp"),
    webpack = require("gulp-webpack"),
    zip = require("gulp-zip");

gulp.task("default", ["clean"], function() {
    return gulp.src("src/lambda-entry-point.js")
        .pipe(webpack({output: {filename: "aws-ebs-snapshot-cleanup"}}))
        .pipe(zip("aws-ebs-snapshot-cleanup.zip"))
        .pipe(gulp.dest("dist"));
});

gulp.task("clean", function() {
    return del("dist/*");
});