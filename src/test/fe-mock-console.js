/**
 * Provides tools for running and evaluating the results of tests that are
 * covering logic which calls various console methods.
 */
module.exports = {
    allMessages: [],
    errorMessages: [],
    infoMessages: [],
    
    originalError: console.error,
    originaInfo: console.info,

    clear: function() {
        module.exports.allMessages.clear();
        module.exports.errorMessages.clear();
        module.exports.infoMessages.clear();
    },

    error: function() {
        var args = Array.from(arguments);

        module.exports.allMessages.push.apply(
            module.exports.allMessages, args);
        module.exports.errorMessages.push.apply(
            module.exports.errorMessages, args);
    },

    info: function() {
        var args = Array.from(arguments);

        module.exports.allMessages.push.apply(
            module.exports.allMessages, args);
        module.exports.infoMessages.push.apply(
            module.exports.infoMessages, args);
    },

    start: function() {
        console.error = module.exports.error;
        console.info = module.exports.info;
    },
    
    stop: function() {
        console.error = module.exports.originalError;
        console.info = module.exports.originaInfo;
    }
};