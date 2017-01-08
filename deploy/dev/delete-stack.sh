STACK_NAME="fe-mattermost-snapshot-cleanup"

echo "Sending request to delete stack $STACK_NAME..."
aws cloudformation delete-stack --stack-name $STACK_NAME