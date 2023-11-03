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

test("Test that there are no unsupressed errors in the CDK NAG output", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test", TestProps);
  Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
  // Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
  const errors = Annotations.fromStack(stack).findError(
    "*",
    Match.stringLikeRegexp("AwsSolutions-.*")
  );
  expect(errors).toHaveLength(0);
});
