import { App, Stage, StageProps } from "aws-cdk-lib";
import { OIDCSetup } from "./lib/stacks/oidcSetup";
import { LeagueLobsterTextReminder } from "./lib/stacks/leagueLobsterTextReminders";
// import { existsSync, readFileSync } from "fs";
import { load } from "js-yaml";
import ContactData from "./contacts";
import { Contacts } from "./types";
import { Construct } from "constructs";
// import { Construct } from "constructs";

// for development, use account/region from cdk cli
// const testEnv = {
//   account: process.env.CDK_DEFAULT_ACCOUNT,
//   region: process.env.CDK_DEFAULT_REGION,
// };

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// const prodEnv = {
//   account: process.env.CDK_DEFAULT_ACCOUNT,
//   region: process.env.CDK_DEFAULT_REGION,
// };

const app = new App();

// let localContacts: any;
let prodContacts: any;

// if (existsSync("./src/contacts.yml")) {
//   const localContactsYml = readFileSync("./src/contacts.yml", "utf-8");
//   localContacts = load(localContactsYml);
// } else {
//   localContacts = Contacts.Test;
// }

if (process.env.CONTACTS_YML) {
  prodContacts = load(process.env.CONTACTS_YML);
} else {
  prodContacts = ContactData.Test;
}

new OIDCSetup(app, "oidc-setup", { env: devEnv });

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

new TextRemindersStage(app, "dev-stage", {
  env: devEnv,
  contacts: ContactData.Test,
});

new TextRemindersStage(app, "test-stage", {
  env: devEnv,
  contacts: ContactData.Test,
});

new TextRemindersStage(app, "prod-stage", {
  env: devEnv,
  contacts: prodContacts,
});

app.synth();
