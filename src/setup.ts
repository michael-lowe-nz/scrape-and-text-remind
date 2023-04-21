import { App } from "aws-cdk-lib";
import { OIDCSetup } from "./lib/stacks/oidcSetup";

const app = new App();

new OIDCSetup(app, "OIDCSetup", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();
