/**
 *  Handles the construction of a deployable Lambda package
*/
var del = require("del"),
    gulp = require("gulp"),
    webpack = require("gulp-webpack"),
    zip = require("gulp-zip");

gulp.task("default", ["clean"], function() {
    // Starts at file from which Lambda will attempt to launch the process.
    return gulp.src("src/lambda-entry-point.js")
        // Bundles all files loaded via require() calls
        .pipe(webpack({
            externals: [
                // The AWS SDK is present whenever running Lambda functions
                // so it does not need to be bundled for deployment.
                "aws-sdk"
            ],
            output: {
                filename: "lambda-entry-point.js",
                // Tells Webpack to export this as a module for Lambda to 
                // consume
                libraryTarget: "commonjs2"
            },
            target: "node"
        }))
        // Wraps library in a zip for publishing
        .pipe(zip("aws-ebs-snapshot-cleanup.zip"))
        // Dumps zip to "dist" directory
        .pipe(gulp.dest("dist"));
});

gulp.task("clean", function() {
    return del("dist/*");
});