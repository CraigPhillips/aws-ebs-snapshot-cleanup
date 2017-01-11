exports.cleaner = require("./snapshot-cleaner");

/**
 * Serves only as an entry point
 */
exports.handler = function(event, context) {
    exports.cleaner.removeExpiredSnapshots()
        .then(result => {
            console.info(
                "Snapshot cleanup finished.",
                result);
            
            var message = 
                "Snapshot cleanup finished. " +
                    "Snapshots deleted: " + result.deletionCount + ".";
            if(result.earliestSnap)
                message += " Earliest deletion: " + result.earliestSnap + ".";
            if(result.latestSnap)
                message += " Most recent deletion: " + result.latestSnap + ".";

            context.succeed(message);
        })
        .catch(error => {
            console.error(
                "Snapshot cleanup failed.",
                error);

            context.fail(
                "Snapshot cleanup failed with error: " +
                error.toString());
        });
};