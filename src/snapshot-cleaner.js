var awsSdk = require("aws-sdk");

module.exports = {
    ec2: new awsSdk.EC2(),
    targetProcess: process,

    /**
     * Attempts to load an environment variable with the provided name. Failures
     * will cause errors to be thrown.
     * 
     * @param variableName The name of the environment variable which should
     * be loaded. If this is null or empty, the function will return null. 
     * If no such environment variable can be found, an error will be thrown.
     */
    loadEnvironmentVariable: function(variableName) {
        if(!variableName) return null;

        if(!this.targetProcess || !this.targetProcess.env)
            throw new Error("Unable to load environment variables");
        if(!this.targetProcess.env[variableName])
            throw new Error(
                "Unable to load environment variable " + variableName);

        return this.targetProcess.env[variableName];
    },

    /**
     * Handles the inspection of a volume's snapshots and the cleanup of those
     * snapshots which are deemed to be too old to keep.
     * 
     * The target volume and date range that determines expirations are both
     * contained in environment variables without which this function call will
     * fail.
     * 
     * @return A promise which either evaluates to an object describing the
     * deletions performed by this operation or an error explaining what went 
     * wrong with the attempt.
     */
    removeExpiredSnapshots: function() {
        return new Promise((fulfill, reject) => {
            try {
                var retentionDays = parseInt(this.loadEnvironmentVariable(
                        "MaximumSnapshotRetentionDays")),
                    volumeId = this.loadEnvironmentVariable("TargetVolumeId");

                if(!retentionDays || 1 > retentionDays || 30 < retentionDays) {
                    throw new Error(
                        "Number of days to retain must be between 1 and 30");
                }
                
                var maxRetentionDate = new Date();
                maxRetentionDate.setDate(
                    maxRetentionDate.getDate() - retentionDays);

                this.ec2.describeSnapshots(
                    {
                        Filters: [{
                            Name: "volume-id",
                            Values: [volumeId]
                        }]
                    },
                    (error, data) => {
                        if(error) {
                            console.error(
                                "Error getting target volume description",
                                error);
                            reject(error);
                        }
                        else {
                            if(!data || !data.Snapshots) {
                                reject(new Error(
                                    "Volume description misformatted"));
                            }
                            else {
                                if(!data.Snapshots.length) 
                                    data.Snapshots.length = 0;

                                var snapshotDeletionPromises = [],
                                    earliestSnap = null,
                                    latestSnap = null;

                                for(var i=0; i<data.Snapshots.length; i++) {
                                    var snapshot = data.Snapshots[i];

                                    if(snapshot.StartTime < maxRetentionDate) {
                                        if(!earliestSnap ||
                                            snapshot.StartTime < earliestSnap)
                                                earliestSnap = 
                                                    snapshot.StartTime;

                                        if(!latestSnap || 
                                            snapshot.StartTime > latestSnap)
                                                latestSnap = snapshot.StartTime;

                                        snapshotDeletionPromises.push(
                                            this.triggerSnapshotDeletion(
                                                snapshot.SnapshotId));
                                    }
                                }

                                Promise.all(snapshotDeletionPromises)
                                    .then(responses => {
                                        fulfill({
                                            deletionCount:
                                                snapshotDeletionPromises.length,
                                            earliestSnap: earliestSnap,
                                            latestSnap: latestSnap
                                        });
                                    })
                                    .catch(firstError => {
                                        reject(firstError);
                                    });
                            }
                        }
                });
            }
            catch(error) {
                console.error(
                    "Failed to remove expired snapshots",
                    error);
                reject(error);
            }
        });
    },

    /**
     * Initiates request to delete the snapshot with the provided ID.
     * 
     * @param snapshotId The ID of the snapshot whose deletion is to be
     * initiated.
     * 
     * @returns A promise which either evaluates to the ID of the snapshot that
     * was deleted or a description of the error that prevented it from 
     * happening correctly.
     */
    triggerSnapshotDeletion: function(snapshotId) {
        return new Promise((fulfill, reject) => {
            if(!snapshotId) reject(new Error("Snapshot ID is required"));
            else {
                this.ec2.deleteSnapshot(
                    {SnapshotId: snapshotId}, 
                    (error, data) => {
                        if(error) {
                            console.error(
                                "Request to delete snapshot failed (" +
                                    snapshotId + ")",
                                error);

                            reject(error);
                        }
                        else fulfill(snapshotId);
                    });
            }
        });
    }
};