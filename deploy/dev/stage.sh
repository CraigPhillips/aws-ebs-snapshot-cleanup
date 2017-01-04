S3_BUCKET_URL="The URL for the staging S3 bucket and folder should go here"

npm run assemble
aws s3 cp dist/aws-ebs-snapshot-cleanup.zip $S3_BUCKET_URL/aws-ebs-snapshot-cleanup.zip
