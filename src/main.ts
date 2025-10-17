import { existsSync, readFileSync } from "fs";
import { App, Aspects, Stage, StageProps } from "aws-cdk-lib";
import { AwsSolutionsChecks, HIPAASecurityChecks } from "cdk-nag";
import { Construct } from "constructs";
import { load } from "js-yaml";
import ContactData from "./contacts";
import { LeagueLobsterTextReminder } from "./stacks/leagueLobsterTextReminders";
import { OIDCSetup } from "./stacks/oidcSetup";
import { TestStack } from "./stacks/testStack";
import { Contacts } from "./types";

const prodEnv = {
  account: "365979456435",
  region: "ap-southeast-2",
};

const app = new App();

new OIDCSetup(app, "oidc-setup");

let localContacts: any;

if (existsSync("./src/contacts.yml")) {
  const localContactsYml = readFileSync("./src/contacts.yml", "utf-8");
  localContacts = load(localContactsYml);
  console.log()
} else {
  localContacts = ContactData.Test;
}

interface StageTemplateProps extends StageProps {
  contacts: Contacts;
  environmentName: string;
  runOnSchedule: boolean;
  runTestsOnDeploy: boolean;
}

class TextRemindersStage extends Stage {
  constructor(scope: Construct, id: string, props: StageTemplateProps) {
    super(scope, id, props);

    const stack = new LeagueLobsterTextReminder(this, "TextReminders", {
      Contacts: props.contacts,
      EnvironmentName: props.environmentName,
      RunOnSchedule: props.runOnSchedule,
    });

    if (props.runTestsOnDeploy) {
      new TestStack(this, "TestStack", {
        RemindLambdaFunction: stack.testFunction,
      });
    }

    Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
    Aspects.of(app).add(new HIPAASecurityChecks({ verbose: true }));
  }
}

new TextRemindersStage(app, "prod-stage", {
  env: prodEnv,
  contacts: localContacts,
  environmentName: "Production",
  runOnSchedule: true,
  runTestsOnDeploy: false,
});

app.synth();
