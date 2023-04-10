import { App, Stack, StackProps } from "aws-cdk-lib";
import { OIDCSetup } from "./lib/stacks/oidcSetup";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SmsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import { Team } from "./types";

export class LeagueLobsterTextReminder extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const data = readFileSync("./src/contacts.yml", "utf-8");
    const contacts: any = load(data);

    contacts.teams.forEach((team: Team) => {
      const teamTopic = new Topic(this, `${team.Name}Alerts`);
      const teamAlertFunction = new NodejsFunction(
        this,
        `Alert${team.Name}Function`,
        {
          runtime: Runtime.NODEJS_18_X,
          entry: "./src/main.GetGamesFunction.ts",
          environment: {
            SNS_TOPIC_ARN: teamTopic.topicArn,
          },
        }
      );
      teamTopic.grantPublish(teamAlertFunction);
      team.Players.forEach((player: any) => {
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

/**
 * This is what happens when you run a local synth without specifying a NODE_ENV
 */
if (!process.env.NODE_ENV) {
  new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-dev", {
    env: devEnv,
  });
}

if (process.env.NODE_ENV === "ci") {
  new OIDCSetup(app, "oidc-setup", { env: devEnv });
  new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-prod", {
    env: devEnv,
  });
}

app.synth();
