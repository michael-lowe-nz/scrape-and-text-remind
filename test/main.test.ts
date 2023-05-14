import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import {
  LeagueLobsterTextReminder,
  LeagueLobsterTextReminderProps,
} from "../src/lib/stacks/leagueLobsterTextReminders";
import { Contacts } from "../src/types";

const testContacts: Contacts = {
  Teams: [
    {
      Name: "Test Team",
      Players: [
        {
          Name: "Test Player",
          Number: "+1",
        },
        {
          Name: "Another Player",
          Number: "+2",
        },
      ],
    },
    {
      Name: "Test Team 2",
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

test("Test that the stack builds an SNS topic with the right number of subscribers in it based on the actual contacts.yml", async () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test", TestProps);

  const template = Template.fromStack(stack);
  expect(template.resourceCountIs("AWS::SNS::Subscription", 4));
  expect(template.resourceCountIs("AWS::SNS::Topic", 2));
});

test("Test that the Text reminder stack builds a lambda function to remind each team", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test", TestProps);
  const template = Template.fromStack(stack);
  expect(template.resourceCountIs("AWS::Lambda::Function", 2));
});
