S3_BUCKET_NAME="[STAGING S3 BUCKET NAME HERE (ie. my-staging-bucket)]"
PKG="aws-ebs-snapshot-cleanup.zip"

echo "Building deployment package..."
npm run assemble

echo "Deploying to S3 bucket $S3_BUCKET_NAME..."
aws s3 cp dist/$PKG s3://$S3_BUCKET_NAME/$PKG
