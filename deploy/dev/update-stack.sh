STACK_NAME="fe-mattermost-snapshot-cleanup"
VOLUME_ID="vol-a0f38d14"

CAPABILITIES="--capabilities CAPABILITY_IAM"
PARAMS="--parameters ParameterKey=TargetVolumeId,ParameterValue=$VOLUME_ID"
STACK="--stack-name $STACK_NAME"
TEMPL="--template-body file://deploy/aws/cloudformation.template"

aws cloudformation update-stack $STACK $TEMPL $PARAMS $CAPABILITIES
