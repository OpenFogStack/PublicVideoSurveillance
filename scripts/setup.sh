#!/bin/bash
set -e


echo "Global: Install Dependencies"
yarn install --non-interactive

echo "Frontend: Install Dependencies"
( cd frontend && yarn install --non-interactive )

echo "Frontend: Build for deployment"
export API_URL=https://${PREFIX}.api.watchyourfac.es/
( cd frontend && yarn generate )
unset API_URL

echo "Global: Install Serverless Globally"
yarn add node@10.6.0 --non-interactive
yarn global add serverless@1.27.3 --non-interactive
