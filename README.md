# League Lobster Text Reminders 📲

[![build](https://github.com/michael-lowe-nz/league-lobster-text-reminders/actions/workflows/build.yml/badge.svg)](https://github.com/michael-lowe-nz/league-lobster-text-reminders/actions/workflows/build.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/michael-lowe-nz/league-lobster-text-reminders/badge.svg)]

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
npx cdk deploy --profile yourprofile oidc-setup
```

After you synth this stack, you should get an "Output" that looks a little like:

```bash
✅  OIDCSetup

✨  Deployment time: 16.67s

Outputs:
OIDCSetup.ExportsOutputFnGetAttGithubDeployRoleXX99 = arn:aws:iam::0000000000:role/OIDCSetup-GithubDeployRoleXX-YY
```

Then you need to take the ARN exported above, and add it as the deployment role to Github as the `DEPLOY_ROLE_ARN`.

Now, when you merge to main, a deployment should kick off to the environment that your role is from .
