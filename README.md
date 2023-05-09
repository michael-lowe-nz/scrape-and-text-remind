# League Lobster Text Reminders 📲

[![build](https://github.com/michael-lowe-nz/league-lobster-text-reminders/actions/workflows/build.yml/badge.svg)](https://github.com/michael-lowe-nz/league-lobster-text-reminders/actions/workflows/build.yml)
![Snyk.io Known Vulnerabilities](https://snyk.io/test/github/michael-lowe-nz/league-lobster-text-reminders/badge.svg)

This repository contains a CDK stack that stands up infrastructure that will text reminders to your teammates about your upcoming games.

# Deploying

You'll need to have AWS credentials, and a target AWS account.

## 1. Bootstrap the account

```bash
yarn
npx cdk bootstrap --profile yourprofile
```

## 2. Deploy the OIDCSetup stack into the target account

```bash
npx cdk deploy --profile yourprofile
```

## 3. Generate the Github Action for Deployment

Now if you run:

```bash
npm run build
```

the `.github/workflows/deploy.yml` will be generated.
Now if you commit and push, and merge to main, deployments will be kicked off ⚡️
