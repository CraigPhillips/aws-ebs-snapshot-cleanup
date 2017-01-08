var cleaner = require("./snapshot-cleaner");

/**
 * Serves only as an entry point
 */
exports.handler = function(event, context) {
    console.log("Event [", event, "]");
    console.log("Context [", context, "]");

    context.succeed("Yup.");
};