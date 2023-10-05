# League Lobster Text Reminders 📲

[![build](https://github.com/michael-lowe-nz/league-lobster-text-reminders/actions/workflows/build.yml/badge.svg)](https://github.com/michael-lowe-nz/league-lobster-text-reminders/actions/workflows/build.yml)
![Snyk.io Known Vulnerabilities](https://snyk.io/test/github/michael-lowe-nz/league-lobster-text-reminders/badge.svg)

This repository contains a CDK stack that stands up infrastructure that will text reminders to your teammates about your upcoming games.

# Deploying

You'll need to have AWS credentials, and a target AWS account.

I usually like to make these things account agnostic, that is, anyone can pick it up and deploy it where they want.
This however is at odds with how CDK generally wants to work. It really wants you to set specific account numbers.
Hence, I've decided to make this operate on a multi account strategy setup.

## 1. Bootstrap the accounts

```bash
yarn

npx cdk bootstrap aws://746512892315/ap-southeast-2 --profile deploy
npx cdk bootstrap aws://653221278763/ap-southeast-2 --trust 746512892315 --cloudformation-execution-policies "arn:aws:iam::aws:policy/AdministratorAccess" --profile textreminders-test
npx cdk bootstrap aws://476203294330/ap-southeast-2 --trust 746512892315 --cloudformation-execution-policies "arn:aws:iam::aws:policy/AdministratorAccess" --profile textreminders-dev
npx cdk bootstrap aws://365979456435/ap-southeast-2 --trust 746512892315 --cloudformation-execution-policies "arn:aws:iam::aws:policy/AdministratorAccess" --profile textreminders-prod
```

## 2. Deploy the OIDCSetup stack into the deploy account

This could be done with a separate deploy account that has trust to the 3 workload accounts. But for now, we are deploying the OIDC stack to each account.

```bash
npx cdk deploy --profile deploy
```

## 3. Generate the Github Action for Deployment

Now if you run:

```bash
npm run build
```

the `.github/workflows/deploy.yml` will be generated.
Now if you commit and push, and merge to main, deployments will be kicked off ⚡️

# Dev

To deploy the dev stage to your AWS account, but not through the pipeline for development, you'll want to run:

```bash
npm run deploy -- --profile yourprofile --app 'cdk.out/assembly-dev-stage'
```