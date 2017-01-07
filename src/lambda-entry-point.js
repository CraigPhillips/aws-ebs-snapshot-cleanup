var cleaner = require("./snapshot-cleaner");

exports.handler = function(event, context) {
    console.log("Cleaner [", cleaner, "]");
    console.log("Exports [", exports, "]");
    console.log("Module Exports [", module.exports, "]");
};