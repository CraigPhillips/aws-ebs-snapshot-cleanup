TARGET_ARN="arn:aws:lambda:us-west-2:636825982361:function:fe-mattermost-snapshot-cleanu-CleanupLambdaProcess-R9XSAS62YYN2"

TARGET="--zip-file fileb://dist/aws-ebs-snapshot-cleanup.zip"

npm run assemble

echo "Publishing Lambda function update..."
aws lambda update-function-code --function-name $TARGET_ARN $TARGET