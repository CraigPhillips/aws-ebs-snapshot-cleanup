STACK_NAME="Your stack name goes here"
VOLUME_ID="Your volume ID goes here"

STACK="--stack-name $STACK_NAME"
TEMPL="--template-body file:///deploy/aws/cloudformation.template"
PARAMS="ParameterKey=TargetVolumeId,ParameterValue=$VOLUME_ID"

aws cloudformation $STACK $TEMPL $PARAMS
