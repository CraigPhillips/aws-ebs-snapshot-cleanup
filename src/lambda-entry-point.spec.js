var entryPoint = require("./lambda-entry-point"),
    mocha = require("mocha"), 
    mockConsole = require("fe-mock-js-console"),
    should = require("should");

describe("lambda-entry-point", () => {
    var context, oldest, latest, successMessage, returnObject,
        errorMessage;

    beforeEach(() => {
        mockConsole.start();

        oldest = new Date();
        latest = new Date();

        oldest.setDate(oldest.getDate() - 10);
        latest.setDate(latest.getDate() - 5);

        returnObject = {
            deletionCount: 15,
            earliestSnap: oldest,
            latestSnap: latest
        };

        entryPoint.cleaner = {
            removeExpiredSnapshots: () => {
                return new Promise((fulfill, reject) => {
                    fulfill(returnObject);
                });
            }
        };

        context = {
            fail: error => {
                errorMessage = error;
            },
            succeed: message => {
                successMessage = message;
            }
        };
    });

    afterEach(() => {
        mockConsole.stop();
    });

    describe("handler", () => {
        it("should report success in simple case", done => {
            entryPoint.handler(null, context);

            return setTimeout(() => {
                mockConsole.infoMessages.length.should.equal(2);
                mockConsole.infoMessages[0].should.equal(
                    "Snapshot cleanup finished.");
                mockConsole.infoMessages[1].should.equal(
                    returnObject);

                successMessage.should.equal(
                    "Snapshot cleanup finished." +
                    " Snapshots deleted: 15." +
                    " Earliest deletion: " + oldest + "." +
                    " Most recent deletion: " + latest + ".");

                done();
            }, 1);
        });

        it("should not include dates for empty results", done => {
            returnObject = {
                deletionCount: 0,
                earliestSnap: null,
                latestSnap: null
            };

            entryPoint.handler(null, context);

            return setTimeout(() => {
                successMessage.should.equal(
                    "Snapshot cleanup finished." +
                        " Snapshots deleted: 0.");

                done();
            }, 1);
        });

        it("should report errors on cleanup failure", done => {
            var error = new Error("Fake error");
            entryPoint.cleaner.removeExpiredSnapshots = () => {
                return new Promise((fulfill, reject) => {
                    reject(error);
                });
            };

            entryPoint.handler(null, context);

            return setTimeout(() => {
                mockConsole.errorMessages.length.should.equal(2);
                mockConsole.errorMessages[0].should.equal(
                    "Snapshot cleanup failed.");
                mockConsole.errorMessages[1].should.equal(
                    error);

                errorMessage.should.equal(
                    "Snapshot cleanup failed with error: " +
                    error.toString());

                done();
            }, 1);
        });
    });
});