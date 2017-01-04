var test = require("./test.js");

exports.handler = function(event, context) {
    console.log("Running");
    console.log("Event [", event, "]");
    console.log("Context [", context, "]");
};