import { App } from "aws-cdk-lib";
import { OIDCSetup } from "./lib/stacks/oidcSetup";
import { LeagueLobsterTextReminder } from "./lib/stacks/leagueLobsterTextReminders";
import { existsSync, readFileSync } from "fs";
import { load } from "js-yaml";

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

let data;

if (existsSync("./src/contacts.yml")) {
  data = readFileSync("./src/contacts.yml", "utf-8");
} else if (process.env.CI === "true") {
  data = readFileSync("./src/test.contacts.yml", "utf-8");
} else {
  data = process.env.CONTACTS_YML;
}

const contacts: any = load(data ? data : "");

if (!process.env.NODE_ENV) {
  new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-dev", {
    env: devEnv,
    Contacts: contacts,
  });
}

if (process.env.NODE_ENV === "ci") {
  new OIDCSetup(app, "oidc-setup", { env: testEnv });
  new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-test", {
    env: testEnv,
    Contacts: contacts,
  });
}

if (process.env.NODE_ENV === "prod") {
  new LeagueLobsterTextReminder(app, "league-lobster-text-reminders-prod", {
    env: prodEnv,
    Contacts: contacts,
  });
}

app.synth();
