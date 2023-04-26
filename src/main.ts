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

/**
 * This is what happens when you run a local synth without specifying a NODE_ENV
 */

/**
 * If we are in dev, we can use the local contacts.yml file, but in our pipelines,
 * we grab this from the environment variables.
 */

// If there is a contacts.yml (in dev, then just use that for the contacts)

// If we are deploying to a test or staging environment, use the test contacts from the contacts.ts file

// If we are deploying to production, then we use the environment var
let localContacts;

if (existsSync("./src/contacts.yml")) {
  localContacts = readFileSync("./src/contacts.yml", "utf-8");
}

// } else if (process.env.CI === "true" && process.env.NODE_ENV !== "prod") {
//   data = readFileSync("./src/test.contacts.yml", "utf-8");
// } else {
//   data = process.env.CONTACTS_YML;
// }

const contacts: any = load(localContacts ? localContacts : "");

new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-dev", {
  env: devEnv,
  Contacts: contacts,
});

new OIDCSetup(app, "oidc-setup", { env: testEnv });
new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-test", {
  env: testEnv,
  Contacts: Contacts.Test,
});

new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-prod", {
  env: prodEnv,
  Contacts: contacts,
});

app.synth();
