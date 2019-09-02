![wyf](frontend/assets/img/wyf-logo-transparent.png)
[![Build Status](https://travis-ci.com/pwillmann/watch-your-face.svg?token=WrsXVexyxmLcbUDYVT99&branch=master)](https://travis-ci.com/pwillmann/watch-your-face)


## Documentation

See this [documentation](https://www.overleaf.com/17842661znjmqtwkzggs#/67635918/)
and [scientific paper](http://www.mcc.tu-berlin.de/fileadmin/fg344/publications/2018-11-01_surveillance_m4iot.pdf) for further information

Bibtex entry for the paper:
````
@inproceedings{grambow_public_2018,
	location = {Rennes, France},
	title = {Public Video Surveillance: Using the Fog to Increase Privacy},
	booktitle = {Proceedings of the 5th Workshop on Middleware and Applications for the Internet of Things (M4IoT 2018)},
	publisher = {{ACM}},
	author = {Grambow, Martin and Hasenburg, Jonathan and Bermbach, David},
	year = {2018},
	langid = {english}
}
````

## Setup

Prerequisites:

* yarn https://yarnpkg.com/en/docs/install
* node (version 10.6.0)
* serverless (version 1.27.3)

If you have a different node version (run `node --version` to find out), install node@10.6.0 using `npm install -g node@10.6.0`. Otherwise install this version from your favorite package manager.  
Install serverless@1.27.3 (to do this, node@10.6.0 is needed or the installation will fail). Run `npm install -g serverless@1.27.3`. If this doesn't work, try `node --version` to check if you have the correct node version (v10.6.0). Also run `serverless --version` to check that your serverless version is correct.

Installation Process:
The very first deploy will take around 40 minutes until everything is up and working so keep that in mind (the local process is about 10 minutes long, the rest takes place on aws)

1.  Make all scripts in `scripts/` executable (eg `chmod +x scripts/setup.sh`, `chmod +x scripts/deploy.sh`, `chmod +x scripts/remove.sh`)
2.  Run `yarn setup` to install all dependencies and build the frontend a first time to deploy it later
3.  If that has not happened: Add yarn bin folder to PATH in order to run serverless `PATH="$PATH:~/.config/yarn/global/node_modules/.bin"`
4.  Setup aws credentials `serverless config credentials --provider aws --key AKABLABLABLA --secret SECRETSECRETSECRET` (check the credentials slack channel)
5.  Make Auth0 API secret available as env variable: `export AUTH0_USER_API_SECRET=SECRETSECRETSECRETSECRET`
6.  Run `yarn deploy <prefix>` where `<prefix>` is your personal dev environment name and the prefix of your git branches (long prefix may cause some deployment issues so keep it short, i.e. 2-3 letters) -> `yarn deploy pw`

This will install all dependencies, build the frontend and deploy everything to aws in your own environment which will be available with the next urls:

1.  Frontend: `prefix.watchyourfac.es`
2.  APIs: `prefix.api.watchyourfac.es/api/`

For manual installation just execute all commands from `scripts/setup` and then `scripts/deploy`.

## Offline

To run and test everything offline use the `scripts/offline` script with your prefix e.g. `./scripts/offline.sh pw`.

This will for now setup a local dynamodb instance running on :8080, api on :4000.

To run the local frontend just call `yarn dev` from the `frontend` directory. The HTTP endpoint will run on :3000.

Note that valid Auth0 credentials are still required for access.

### Stages

TravisCI is configured to deploy to a specific stage when a push is made to the repo. The stage name is based on the branchname, keep your branch-naming consistent.

Naming Strategy: `<prefix>/<branch-name>` (eg. `pw/setup-ci`)

Right now TravisCI only deploys but does not remove or cleanup, to do that use the following commands:

1.  To Remove everything run the `.travis/local-remove.sh` script (chmod +x might be needed)
2.  Update Frontend (after building locally): `sls s3sync --stage=pw` (`pw` is your stage name / prefix)

Always include the `--stage=xyz` affix with your specific name!

## Some helpful commands:

* Remove everything and stop all services: serverless deploy `serverless remove`
* Deploy only a specific function with name `getThis` `serverless deploy function -f getThis`
* Invoke a specific function with name `getThis` `serverless invoke -f getThis -l`

For everthing else please check the serverless docs!

## Log Management for Developers

See this [link](secure-log-api/readme.md)

## Model Training in Backend

See this [link](modeltraining/README.md)

## Edge Management

See this [link](edge-api/README.md)

## User Management

See this [link](auth0/userManagement/README.md)

## Approval Workflow

See this [link](approval-api/README.md)

## Git Workflow

The `master` branch is protected and only approved pull requests can push to it. Most important part of
the workflow is `rebase`, heres a refresher on merging vs rebasing https://www.atlassian.com/git/tutorials/merging-vs-rebasing.

How do I push changes to the `master` branch?

1.  Switch to `master` -> `git checkout master`
2.  Update `master` -> `git pull --rebase` (ALWAYS use `rebase` when pulling!!!)
3.  Create new branch from `master` -> `git checkout -b pw/new-feature` (where 'pw/' is your own name/abbreviation)
4.  Work on branch and push changes
5.  Rebase master onto branch to not have merge conflicts later -> `git pull origin master --rebase` (AGAIN use`--rebase`)
6.  Push branch again, this time force push to include rebased master (`git push --force`)
7.  Create a pull request from github.com
8.  Get pull request reviewed and merge it into master

Some last words, keep pull requests small (not 100 files changed etc :D), so they are easier to review and rather create a lot of pull requests than one big
