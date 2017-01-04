S3_BUCKET_NAME="The URL for the staging S3 bucket and folder should go here"
PKG="aws-ebs-snapshot-cleanup.zip"

echo "Building deployment package..."
npm run assemble

echo "Deploying to S3 bucket $S3_BUCKET_NAME..."
aws s3 cp dist/$PKG s3://$S3_BUCKET_NAME/$PKG
