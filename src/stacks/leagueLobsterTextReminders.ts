import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import {
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Alias } from "aws-cdk-lib/aws-kms";
import { IFunction, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SmsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { NagSuppressions } from "cdk-nag";
import { Construct } from "constructs";
import { Contacts, Team } from "../types";

export interface LeagueLobsterTextReminderProps extends StackProps {
  Contacts: Contacts;
  EnvironmentName: string;
  RunOnSchedule: boolean;
}

export class LeagueLobsterTextReminder extends Stack {
  public testFunction: IFunction | null;
  constructor(
    scope: Construct,
    id: string,
    props: LeagueLobsterTextReminderProps
  ) {
    super(scope, id, props);

    const snsKey = Alias.fromAliasName(this, "aws-sns-key", "alias/aws/sns");

    this.testFunction = null;

    props.Contacts.Teams.forEach((team: Team, index: number) => {
      const teamTopic = new Topic(this, `${team.Name}Alerts`, {
        masterKey: snsKey,
      });

      const teamAdminTopic = new Topic(this, `${team.Name}AdminAlerts`, {
        masterKey: snsKey,
      });

      const teamAlertFunctionRole = new Role(
        this,
        `Alert${team.Name}FunctionRole`,
        {
          assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        }
      );

      const teamAlertFunction = new NodejsFunction(
        this,
        `Alert${team.Name}Function`,
        {
          runtime: Runtime.NODEJS_22_X,
          entry: "./src/processGamesForTeam/index.ts",
          environment: {
            SNS_TOPIC_ARN: teamTopic.topicArn,
            SNS_ADMIN_TOPIC_ARN: teamAdminTopic.topicArn,
            TEAM_NAME: team.Name,
            TZ: "Pacific/Auckland",
            SCHEDULE_URL: team.ScheduleURL,
            ENVIRONMENT_NAME: props.EnvironmentName,
          },
          timeout: Duration.seconds(5),
          tracing: Tracing.ACTIVE,
          role: teamAlertFunctionRole,
        }
      );

      if (index === 0) {
        this.testFunction = teamAlertFunction;
      }

      const basicLambdaPolicy = new Policy(this, `Alert${team.Name}Policy`, {
        statements: [
          new PolicyStatement({
            actions: [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents",
            ],
            resources: [
              `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${teamAlertFunction.functionName}:*`,
            ],
          }),
        ],
      });

      teamAlertFunction.role?.attachInlinePolicy(basicLambdaPolicy);

      NagSuppressions.addResourceSuppressions(
        teamAlertFunction,
        [
          {
            id: "AwsSolutions-IAM5",
            reason: "This wildcard might be necessary",
            appliesTo: ["Resource::*"],
          },
          {
            id: "AwsSolutions-IAM5",
            reason: "This wildcard might be necessary",
            appliesTo: ["Resource::*"],
          },
        ],
        true
      );

      NagSuppressions.addResourceSuppressions(
        basicLambdaPolicy,
        [
          {
            id: "AwsSolutions-IAM5",
            reason: "This wildcard might be necessary",
            appliesTo: ["Resource::*"],
          },
          {
            id: "AwsSolutions-IAM5",
            reason: "This wildcard might be necessary",
            appliesTo: [
              // { regex: "Resource::arn:aws:logs:ap-southeast-2:476203294330:log-group:AlertGenXFunction8E4EBA9D:*" },
              { regex: "/^Resource::arn:aws:logs:(.*)\\*$/g" },
              // regex: '/^Resource::arn:aws:sqs:(.*):\\*$/g',
            ],
          },
        ],
        true
      );

      NagSuppressions.addResourceSuppressions(
        teamAlertFunctionRole,
        [
          {
            id: "AwsSolutions-IAM5",
            reason: "This wildcard might be necessary",
            appliesTo: ["Resource::*"],
          },
        ],
        true
      );

      // NagSuppressions.addResourceSuppressions(
      //   deployRole,
      //   [
      //     {
      //       id: "AwsSolutions-IAM5",
      //       reason:
      //         "This is from a 3rd party construct. We could look to implement our own to mitigate",
      //       appliesTo: ["Resource::*"],
      //     },
      //   ],
      //   true
      // );

      // Trigger the lambda for each team at 8:30pm every Sunday (NZT)
      // As NZT is UTC+12 (UTC+13 in daylight savings time)
      // and the cron expresssions are for UTC time, we subtract 12 hours.
      // When the L2 constructs are available for the EventBridge Scheduler:
      // https://github.com/aws/aws-cdk-rfcs/blob/master/text/0474-event-bridge-scheduler-l2.md
      // will probably swap this to a scheduler implementation which includes timezone support

      if (props.RunOnSchedule) {
        new events.Rule(this, `${team.Name}Rule`, {
          schedule: events.Schedule.cron({
            minute: "30",
            hour: "8",
            weekDay: "SUN",
          }),
          targets: [new targets.LambdaFunction(teamAlertFunction)],
        });
      }

      // Allow each function to publish to the topic
      teamTopic.grantPublish(teamAlertFunction);
      teamAdminTopic.grantPublish(teamAlertFunction);

      team.Players.forEach((player: any) => {
        teamTopic.addSubscription(new SmsSubscription(player.Number));

        if (player.IsAdmin) {
          teamAdminTopic.addSubscription(new SmsSubscription(player.Number));
        }
      });
    });
  }
}
