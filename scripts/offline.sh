#!/bin/bash
set -e

PREFIX=$1
if [ -z "$1" ]
then
    echo "An environment must be specified!"
    exit 1
fi
echo "Deploy offline to ${PREFIX}"

# Deploy to Stage / Production
sls dynamodb install --stage=${PREFIX}
sls offline start --stage=${PREFIX}