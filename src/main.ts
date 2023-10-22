import { existsSync, readFileSync } from "fs";
import { App, Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { load } from "js-yaml";
import ContactData from "./contacts";
import { LeagueLobsterTextReminder } from "./stacks/leagueLobsterTextReminders";
import { OIDCSetup } from "./stacks/oidcSetup";
import { Contacts } from "./types";

const testEnv = {
  account: "653221278763",
  region: "ap-southeast-2",
};

const devEnv = {
  account: "476203294330",
  region: "ap-southeast-2",
};

const prodEnv = {
  account: "365979456435",
  region: "ap-southeast-2",
};

const app = new App();

new OIDCSetup(app, "oidc-setup");

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

new TextRemindersStage(app, "dev-stage", {
  env: devEnv,
  contacts: localContacts,
});

new TextRemindersStage(app, "test-stage", {
  env: testEnv,
  contacts: ContactData.Test,
});

new TextRemindersStage(app, "prod-stage", {
  env: prodEnv,
  contacts: prodContacts,
});

app.synth();
