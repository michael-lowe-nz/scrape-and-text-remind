import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { LeagueLobsterTextReminder } from "../src/main";

test("Snapshot", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test");

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

test("Test that the stack builds an SNS topic", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test");

  const template = Template.fromStack(stack);
  expect(template.hasResource("AWS::SNS::Topic", {}));
});
