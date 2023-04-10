import { App } from "aws-cdk-lib";
import { OIDCSetup } from "./lib/stacks/oidcSetup";
import { LeagueLobsterTextReminder } from "./lib/stacks/leagueLobsterTextReminders";
import { readFileSync } from "fs";
import { load } from "js-yaml";

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

/**
 * This is what happens when you run a local synth without specifying a NODE_ENV
 */

const data = readFileSync("./src/contacts.yml", "utf-8");
const contacts: any = load(data);

if (!process.env.NODE_ENV) {
  new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-dev", {
    env: devEnv,
    Contacts: contacts,
  });
}

if (process.env.NODE_ENV === "ci") {
  new OIDCSetup(app, "oidc-setup", { env: devEnv });
  new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-prod", {
    env: devEnv,
    Contacts: contacts,
  });
}

if (process.env.NODE_ENV === "stage") {
  new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-stage", {
    env: devEnv,
    Contacts: contacts,
  });
}

app.synth();
