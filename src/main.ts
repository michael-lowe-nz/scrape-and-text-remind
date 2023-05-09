import { existsSync, readFileSync } from "fs";
import { App, Stage, StageProps } from "aws-cdk-lib";
import { ShellStep } from "aws-cdk-lib/pipelines";
import { AwsCredentials, GitHubWorkflow } from "cdk-pipelines-github";
import { Construct } from "constructs";
import { load } from "js-yaml";
import ContactData from "./contacts";
import { LeagueLobsterTextReminder } from "./lib/stacks/leagueLobsterTextReminders";
import { OIDCSetup } from "./lib/stacks/oidcSetup";
import { Contacts } from "./types";

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

let localContacts: any;
let prodContacts: any;

if (existsSync("./src/contacts.yml")) {
  const localContactsYml = readFileSync("./src/contacts.yml", "utf-8");
  localContacts = load(localContactsYml);
} else {
  localContacts = ContactData.Test;
}

if (process.env.CONTACTS_YML) {
  prodContacts = load(process.env.CONTACTS_YML);
} else {
  prodContacts = ContactData.Test;
}

const oidcStack = new OIDCSetup(app, "oidc-setup", { env: devEnv });

interface StageTemplateProps extends StageProps {
  contacts: Contacts;
}

class TextRemindersStage extends Stage {
  constructor(scope: Construct, id: string, props: StageTemplateProps) {
    super(scope, id, props);

    new LeagueLobsterTextReminder(this, "TextReminders", {
      Contacts: props.contacts,
    });
  }
}

const pipeline = new GitHubWorkflow(app, "Pipeline", {
  synth: new ShellStep("Build", {
    commands: ["npm run synth"],
  }),
  awsCreds: AwsCredentials.fromOpenIdConnect({
    gitHubActionRoleArn: oidcStack.role.roleArn,
  }),
});

const devStage = new TextRemindersStage(app, "dev-stage", {
  env: devEnv,
  contacts: localContacts,
});

new TextRemindersStage(app, "test-stage", {
  env: devEnv,
  contacts: ContactData.Test,
});

const prodStage = new TextRemindersStage(app, "prod-stage", {
  env: devEnv,
  contacts: prodContacts,
});

pipeline.addStageWithGitHubOptions(devStage, {
  gitHubEnvironment: { name: "Test" },
});

pipeline.addStageWithGitHubOptions(prodStage, {
  gitHubEnvironment: { name: "Production" },
});

app.synth();
