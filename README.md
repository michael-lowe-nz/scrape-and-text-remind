# League Lobster Text Reminders 📲

[![build](https://github.com/michael-lowe-nz/league-lobster-text-reminders/actions/workflows/build.yml/badge.svg)](https://github.com/michael-lowe-nz/league-lobster-text-reminders/actions/workflows/build.yml)

This repository contains a CDK stack that stands up infrastructure that will text reminders to your teammates about your upcoming games.

# Deploying

You'll need to have AWS credentials, and a target AWS account.

## 1. Bootstrap the account

```bash
yarn
npx cdk bootstrap --profile yourprofile
```

2. Deploy the OIDCSetup stack into the target account

```bash
npm run deploy -- --profile yourprofile OIDCSetup
```

Now,

First you'll need to deploy the `oidcSetup` stack to the target account in order for the Github action to be able to assume the deployment role.

WIP... How does this work the first time?