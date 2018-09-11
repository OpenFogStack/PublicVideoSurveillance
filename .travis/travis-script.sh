#!/bin/bash
set -ev

STAGE="dev"
BRANCH=${TRAVIS_BRANCH}
# Split branchname by '/' and get prefix to name stage env
IFS=/ read -r PREFIX TRAIL <<< "${BRANCH}"
echo prefix=${PREFIX}

if [ ${PREFIX} == 'master' ] && [ ${TRAVIS_PULL_REQUEST} == 'false' ]
then
    STAGE="dev"
else
    STAGE=${PREFIX}
fi

echo "Frontend: Run Lint"
( cd frontend && yarn lint )
echo "Frontend: Build for Deployment"
export API_URL=https://${STAGE}.api.watchyourfac.es/
( cd frontend && yarn generate )
unset API_URL

