STACK_NAME="[TARGET STACK NAME HERE] (ie. volume-cleanup-stack)"

echo "Sending request to delete stack $STACK_NAME..."
aws cloudformation delete-stack --stack-name $STACK_NAME