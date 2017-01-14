var cleaner = require("./snapshot-cleaner"),
    mocha = require("mocha"), 
    mockConsole = require("fe-mock-js-console"),
    should = require("should");

describe("snapshot-cleaner", () => {
    beforeEach(() => {
        mockConsole.start();

        cleaner.targetProcess = {
            env: {
                testVariable: "testValue"
            }
        };

        cleaner.ec2 = {
            deleteSnapshot: (params, callback) => {
                callback(null, "Faking that it worked.");
            }
        };
    });

    afterEach(() => {
        mockConsole.stop();
    });

    describe("loadEnvironmentVariables", () => {
        it("should retrieve present variables", () => {
            cleaner.loadEnvironmentVariable("testVariable")
                .should.equal(
                    cleaner.targetProcess.env.testVariable);
        });

        it("should return null for empty variable name", () => {
            should.not.exist(
                cleaner.loadEnvironmentVariable(null));
        });

        it("should throw error for missing process", () => {
            cleaner.targetProcess = null;

            cleaner.loadEnvironmentVariable
                .bind(cleaner, "testVariable")
                .should.throw(
                    "Unable to load environment variables");
        });

        it("should throw error for missing variables", () => {
            cleaner.loadEnvironmentVariable
                .bind(cleaner, "somethingElse")
                .should.throw(
                    "Unable to load environment variable " +
                    "somethingElse");
        });
    });

    describe("triggerSnapshotDeletion", () => {
        it("should retrieve snapshot ID", () => {
            return cleaner.triggerSnapshotDeletion("1234")
                .then(id => {
                    id.should.equal("1234");
                });
        });
    });
});