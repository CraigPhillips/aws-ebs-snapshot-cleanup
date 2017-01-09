STACK_NAME="fe-mattermost-snapshot-cleanup"
RET_DAYS="14"
VOLUME_ID="vol-a0f38d14"

CAPABILITIES="--capabilities CAPABILITY_IAM"
DAYS_PARAM="ParameterKey=MaximumSnapshotRetentionDays,ParameterValue=$RET_DAYS"
VOLUME_ID_PARAM="ParameterKey=TargetVolumeId,ParameterValue=$VOLUME_ID"
PARAMS="--parameters $DAYS_PARAM $VOLUME_ID_PARAM"
STACK="--stack-name $STACK_NAME"
TEMPL="--template-body file://deploy/aws/cloudformation.template"

deploy/dev/stage.sh

echo "Sending request to create stack $STACK_NAME..."
aws cloudformation create-stack $STACK $TEMPL $PARAMS $CAPABILITIES
