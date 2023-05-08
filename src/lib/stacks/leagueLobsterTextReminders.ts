import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Key } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SmsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { Contacts, Team } from "../../types";

export interface LeagueLobsterTextReminderProps extends StackProps {
  Contacts: Contacts;
}

export class LeagueLobsterTextReminder extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: LeagueLobsterTextReminderProps
  ) {
    super(scope, id, props);

    const snsKey = new Key(this, "sns-kms-key", {
      removalPolicy: RemovalPolicy.DESTROY,
      pendingWindow: Duration.days(7),
      description: "KMS key for encrypting the objects in an S3 bucket",
      enableKeyRotation: false,
    });

    props.Contacts.Teams.forEach((team: Team) => {
      const teamTopic = new Topic(this, `${team.Name}Alerts`, {
        masterKey: snsKey,
      });

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
