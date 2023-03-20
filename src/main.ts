import { App, Stack, StackProps } from "aws-cdk-lib";
import {
  Effect,
  OpenIdConnectProvider,
  PolicyDocument,
  PolicyStatement,
  Role,
  WebIdentityPrincipal,
} from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SmsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import { load } from "js-yaml";

export class LeagueLobsterTextReminder extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    new NodejsFunction(this, "GetGamesFunction", {
      runtime: Runtime.NODEJS_18_X,
    });

    const githubProvider = new OpenIdConnectProvider(
      this,
      "GithubOIDCProvider",
      {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
      }
    );

    new Role(this, "GithubDeployRole", {
      assumedBy: new WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            "token.actions.githubusercontent.com:sub":
              "repo:michael-lowe-nz/league-lobster-text-reminders:ref:refs/heads/main",
          },
        }
      ),
      description: "Role to be used by Github actions",
      inlinePolicies: {
        CdkDeploymentPolicy: new PolicyDocument({
          assignSids: true,
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["sts:AssumeRole"],
              resources: [`arn:aws:iam::${this.account}:role/cdk-*`],
            }),
          ],
        }),
      },
    });

    const data = readFileSync("./src/contacts.yml", "utf-8");
    const contacts: any = load(data);
    contacts.teams.forEach((team: any) => {
      console.log("TEAM:", team.Name);
      const teamTopic = new Topic(this, `${team.Name}Alerts`);
      team.Players.forEach((player: any) => {
        console.log("PLAYER:", player);
        teamTopic.addSubscription(new SmsSubscription(player.Number));
      });
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-dev", {
  env: devEnv,
});
// new LeagueLobsterTextReminder(app, 'league-lobster-text-reminders-prod', { env: prodEnv });

app.synth();
