#!/bin/bash
set -e

PREFIX=$1
if [ -z "$1" ]
then
    echo "An environment must be specified!"
    exit 1
fi
echo "Undeploy ${PREFIX}"

# Deploy to Stage / Production
sls delete_domain --stage=$PREFIX
sls remove --stage=$PREFIX

