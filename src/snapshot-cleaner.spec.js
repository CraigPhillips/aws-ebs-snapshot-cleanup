var cleaner = require("./snapshot-cleaner"),
    mocha = require("mocha"), 
    mockConsole = require("fe-mock-js-console"),
    should = require("should");

describe("snapshot-cleaner", () => {
    var envVariables,
        lastMonth = new Date(),
        lastMonth2 = new Date(),
        snapshotDescription,
        twoMonthsAgo = new Date(),
        yesterday = new Date();

    lastMonth.setDate(lastMonth.getDate() - 39);
    lastMonth2.setDate(lastMonth2.getDate() - 40);
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 75);
    yesterday.setDate(yesterday.getDate() - 1);

    beforeEach(() => {
        mockConsole.start();
        mockConsole.clear();

        envVariables = {
            MaximumSnapshotRetentionDays: 30,
            TargetVolumeId: "vol-1234",
            testVariable: "testValue"
        };

        snapshotDescription  = {
            Snapshots: [
                { StartTime: twoMonthsAgo, SnapshotId: "1"},
                { StartTime: yesterday, SnapshotId: "2" },
                { StartTime: lastMonth, SnapshotId: "3" },
                { StartTime: lastMonth2, SnapshotId: "4"}
            ]
        };

        cleaner.targetProcess = {
            env: envVariables
        };

        cleaner.ec2 = {
            deleteSnapshot: (params, callback) => {
                callback(null, "Faking that it worked.");
            },
            describeSnapshots: (params, callback) => {
                callback(null, snapshotDescription);
            }
        };
    });

    afterEach(() => {
        mockConsole.clear();
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

        it("should fail with no snapshot ID", () => {
            return cleaner.triggerSnapshotDeletion(null)
                .then(id => {
                    throw new Error("should have failed")
                })
                .catch(error => {
                    error.message.should.equal(
                        "Snapshot ID is required");
                });
        });

        it("should fail if deletion returns error", () => {
            cleaner.ec2.deleteSnapshot = (params, callback) => {
                callback("Faking failure", null);
            };

            return cleaner.triggerSnapshotDeletion("1234")
                .then(id => {
                    throw new Error("should have failed")
                })
                .catch(error => {
                    mockConsole.errorMessages.length.should.equal(2);
                    mockConsole.errorMessages[0].should.equal(
                        "Request to delete snapshot failed (1234)");
                    mockConsole.errorMessages[1].should.equal(
                        "Faking failure");

                    error.should.equal("Faking failure");
                });
        });
    });

    describe("removeExpiredSnapshots", () => {
        it("should delete expired snapshots", () => {
            return cleaner.removeExpiredSnapshots()
                .then(results => {
                    results.deletionCount.should.equal(3);
                    results.earliestSnap.should.equal(
                        twoMonthsAgo);
                    results.latestSnap.should.equal(
                        lastMonth);
                });
        });

        it("should do nothing when no snapshots are present", () => {
            snapshotDescription = { Snapshots: [] };

            return cleaner.removeExpiredSnapshots()
                .then(results => {
                    results.deletionCount.should.equal(0);
                    should.not.exist(results.earliestSnap);
                    should.not.exist(results.latestSnap);
                });
        });

        it("should fail with out of bounds retention days", () => {
            envVariables.MaximumSnapshotRetentionDays = 75;

            return cleaner.removeExpiredSnapshots()
                .then(results => {
                    throw new Error("should have failed");
                })
                .catch(error => {
                    mockConsole.errorMessages.length.should.equal(2);
                    mockConsole.errorMessages[0].should.equal(
                        "Failed to remove expired snapshots");
                    mockConsole.errorMessages[1].message.should.equal(
                        "Number of days to retain must be between 1 and 30");

                    error.message.should.equal(
                        "Number of days to retain must be between 1 and 30");
                });
        });

        it("should fail if volume description request fails", () => {
            cleaner.ec2.describeSnapshots = (params, callback) => {
                callback("Faking a failure", null);
            };

            return cleaner.removeExpiredSnapshots()
                .then(results => {
                    throw new Error("should have failed");
                })
                .catch(error => {
                    mockConsole.errorMessages.length.should.equal(2);
                    mockConsole.errorMessages[0].should.equal(
                        "Error getting target volume description");
                    mockConsole.errorMessages[1].should.equal(
                        "Faking a failure");

                    error.should.equal("Faking a failure");
                });
        });

        it("should fail if volume description is missing Snapshot data", () => {
            snapshotDescription = {};

            return cleaner.removeExpiredSnapshots()
                .then(results => {
                    throw new Error("should have failed");
                })
                .catch(error => {
                    error.message.should.equal(
                        "Volume description misformatted");
                });
        });

        it("should fail if a deletion request fails", () => {
            snapshotDescription.Snapshots = [{ StartTime: lastMonth }];

            return cleaner.removeExpiredSnapshots()
                .then(results => {
                    throw new Error("should have failed");
                })
                .catch(error => {
                    error.message.should.equal(
                        "Snapshot ID is required");
                });
        });
    });
});