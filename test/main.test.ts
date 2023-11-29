import { App, Aspects } from "aws-cdk-lib";
import { Annotations, Match, Template } from "aws-cdk-lib/assertions";
import { AwsSolutionsChecks } from "cdk-nag";
import {
  LeagueLobsterTextReminder,
  LeagueLobsterTextReminderProps,
} from "../src/stacks/leagueLobsterTextReminders";
import { Contacts } from "../src/types";

const testContacts: Contacts = {
  Teams: [
    {
      Name: "Test Team",
      ScheduleURL:
        "https://websites.mygameday.app/team_info.cgi?c=0-2854-0-633233-27116561&a=SFIX",
      Players: [
        {
          Name: "Test Player",
          Number: "+1",
          IsAdmin: true,
        },
        {
          Name: "Another Player",
          Number: "+2",
        },
      ],
    },
    {
      Name: "Test Team 2",
      ScheduleURL:
        "https://websites.mygameday.app/team_info.cgi?c=0-2854-0-633233-27116561&a=SFIX",
      Players: [
        {
          Name: "Test Player",
          Number: "+3",
        },
        {
          Name: "Another Player",
          Number: "+4",
        },
      ],
    },
  ],
};

const TestProps: LeagueLobsterTextReminderProps = {
  Contacts: testContacts,
  EnvironmentName: "Test",
  RunOnSchedule: true,
};

test("Snapshot", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test", TestProps);

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

test("Test that the stack builds an SNS topic", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test", TestProps);

  const template = Template.fromStack(stack);
  expect(template.hasResource("AWS::SNS::Topic", {}));
});

test("Test that the Text reminder stack builds a lambda function to remind each team", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test", TestProps);
  const template = Template.fromStack(stack);
  expect(template.resourceCountIs("AWS::Lambda::Function", 2));
});

test("Test that there are no unsupressed errors in the CDK NAG output for the AWS Solutions Pack", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test", TestProps);
  Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
  const errors = Annotations.fromStack(stack).findError(
    "*",
    Match.stringLikeRegexp("AwsSolutions-.*")
  );
  expect(errors).toHaveLength(0);
});

test("Test that if RunsOnSchedule is set to FALSE, no event bridge rule is created", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test", {
    ...TestProps,
    RunOnSchedule: false,
  });
  const template = Template.fromStack(stack);
  expect(template.resourceCountIs("AWS::Events::Rule", 0));
});

test("Test that if RunsOnSchedule is set to TRUE, event bridge rule(s) are created", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test", {
    ...TestProps,
    RunOnSchedule: true,
  });
  const template = Template.fromStack(stack);
  expect(template.hasResource("AWS::Events::Rule", {}));
});
