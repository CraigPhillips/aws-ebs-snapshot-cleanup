STACK_NAME="[TARGET STACK NAME HERE] (ie. volume-cleanup-stack)"
RET_DAYS="10"
VOLUME_ID="[TARGET VOLUME ID HERE] (ie. vol-1234)"

CAPABILITIES="--capabilities CAPABILITY_IAM"
DAYS_PARAM="ParameterKey=MaximumSnapshotRetentionDays,ParameterValue=$RET_DAYS"
VOLUME_ID_PARAM="ParameterKey=TargetVolumeId,ParameterValue=$VOLUME_ID"
PARAMS="--parameters $DAYS_PARAM $VOLUME_ID_PARAM"
STACK="--stack-name $STACK_NAME"
TEMPL="--template-body file://deploy/aws/cloudformation.template"

deploy/dev/stage.sh

echo "Sending request to update stack $STACK_NAME..."
aws cloudformation update-stack $STACK $TEMPL $PARAMS $CAPABILITIES
