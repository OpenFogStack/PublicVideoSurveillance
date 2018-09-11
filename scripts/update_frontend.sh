#!/bin/bash
set -e

PREFIX=$1
if [ -z "$1" ]
then
    echo "An environment must be specified!"
    exit 1
fi
echo "Deploy to ${PREFIX}"

echo "Frontend: Build for deployment"
export API_URL=https://${PREFIX}.api.watchyourfac.es/
( cd frontend && yarn generate )
unset API_URL

# Deploy to Stage / Production
sls s3sync --stage=$PREFIX -v