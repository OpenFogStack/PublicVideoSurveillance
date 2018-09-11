#!/bin/bash
set -ev

STAGE="dev"
BRANCH=${TRAVIS_BRANCH} 
echo branch=${BRANCH}
# Split branchname by '/' and get prefix to name stage env
IFS=/ read -r PREFIX TRAIL <<< "${BRANCH}"
echo prefix=${PREFIX}

if [ ${PREFIX} == 'master' ] && [ ${TRAVIS_PULL_REQUEST} == 'false' ]
then
    STAGE="dev"
else
    STAGE=${PREFIX}
fi
echo stage=${STAGE}

echo "Install Serverless Dependencies"
yarn install --non-interactive
# Deploy to Stage / Production
sls create_domain --stage=$STAGE
sls deploy --stage=$STAGE

