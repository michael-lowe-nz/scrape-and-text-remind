import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SmsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { Contacts, Team } from "../types";

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

    props.Contacts.Teams.forEach((team: Team) => {
      const teamTopic = new Topic(this, `${team.Name}Alerts`, {});

      const teamAlertFunction = new NodejsFunction(
        this,
        `Alert${team.Name}Function`,
        {
          runtime: Runtime.NODEJS_18_X,
          entry: "./src/processGamesForTeam/index.ts",
          environment: {
            SNS_TOPIC_ARN: teamTopic.topicArn,
            TZ: "Pacific/Auckland",
          },
          timeout: Duration.seconds(5),
          tracing: Tracing.ACTIVE,
        }
      );

      // Trigger the lambda for each team at 8:30pm every Sunday (NZT)
      // As NZT is UTC+12 (UTC+13 in daylight savings time)
      // and the cron expresssions are for UTC time, we subtract 12 hours.
      // When the L2 constructs are available for the EventBridge Scheduler:
      // https://github.com/aws/aws-cdk-rfcs/blob/master/text/0474-event-bridge-scheduler-l2.md
      // will probably swap this to a scheduler implementation which includes timezone support
      new events.Rule(this, `${team.Name}Rule`, {
        schedule: events.Schedule.cron({
          minute: "30",
          hour: "8",
          weekDay: "SUN",
        }),
        targets: [new targets.LambdaFunction(teamAlertFunction)],
      });

      // Allow each function to publish to the topic
      teamTopic.grantPublish(teamAlertFunction);

      team.Players.forEach((player: any) => {
        teamTopic.addSubscription(new SmsSubscription(player.Number));
      });
    });
  }
}
