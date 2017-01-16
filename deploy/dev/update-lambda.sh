TARGET_ARN="[TARGET LAMBDA FUNCTION ARN HERE] (ie. arn:aws:lambda:...)"

TARGET="--zip-file fileb://dist/aws-ebs-snapshot-cleanup.zip"

npm run assemble

echo "Publishing Lambda function update..."
aws lambda update-function-code --function-name $TARGET_ARN $TARGET