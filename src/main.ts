import { existsSync, readFileSync } from "fs";
import { App, Stage, StageProps } from "aws-cdk-lib";
import { ShellStep } from "aws-cdk-lib/pipelines";
import { AwsCredentials, GitHubWorkflow } from "cdk-pipelines-github";
import { Construct } from "constructs";
import { load } from "js-yaml";
import ContactData from "./contacts";
import { LeagueLobsterTextReminder } from "./stacks/leagueLobsterTextReminders";
import { Contacts } from "./types";

const devEnv = {
  account: "825411367293",
  region: "ap-southeast-2",
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
    commands: ["yarn", "yarn build"],
    env: {
      CONTACTS_YML: "${{ vars.CONTACTS_YML }}",
      TEST_PHONE_NUMBER: "${{ vars.TEST_PHONE_NUMBER }}",
    },
  }),
  awsCreds: AwsCredentials.fromOpenIdConnect({
    gitHubActionRoleArn:
      "arn:aws:iam::825411367293:role/oidc-setup-GithubDeployRoleB0CF66A5-16XETSY331029",
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
