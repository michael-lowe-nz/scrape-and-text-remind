import { App } from "aws-cdk-lib";
import { OIDCSetup } from "./lib/stacks/oidcSetup";
import { LeagueLobsterTextReminder } from "./lib/stacks/leagueLobsterTextReminders";
import { existsSync, readFileSync } from "fs";
import { load } from "js-yaml";
import Contacts from "./contacts";

// for development, use account/region from cdk cli
const testEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const prodEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

let localContacts: any;
let prodContacts: any;

if (existsSync("./src/contacts.yml")) {
  const localContactsYml = readFileSync("./src/contacts.yml", "utf-8");
  localContacts = load(localContactsYml);
}

if (process.env.CONTACTS_YML) {
  prodContacts = load(process.env.CONTACTS_YML);
} else {
  prodContacts = Contacts.Test;
}

new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-dev", {
  env: devEnv,
  Contacts: localContacts,
});

new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-test", {
  env: testEnv,
  Contacts: Contacts.Test,
});

new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-prod", {
  env: prodEnv,
  Contacts: prodContacts,
});

new OIDCSetup(app, "oidc-setup", { env: testEnv });

app.synth();
