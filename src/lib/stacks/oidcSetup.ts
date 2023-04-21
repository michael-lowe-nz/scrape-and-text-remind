import { Stack, StackProps, aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";

export class OIDCSetup extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    const githubProvider = new iam.OpenIdConnectProvider(
      this,
      "GithubOIDCProvider",
      {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
      }
    );

    const deployRole = new iam.Role(this, "GithubDeployRole", {
      assumedBy: new iam.WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            "token.actions.githubusercontent.com:sub":
              "repo:michael-lowe-nz/league-lobster-text-reminders:ref:refs/heads/main",
          },
        }
      ),
      description: "Role to be used by Github actions",
      inlinePolicies: {
        CdkDeploymentPolicy: new iam.PolicyDocument({
          assignSids: true,
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["sts:AssumeRole"],
              resources: [`arn:aws:iam::${this.account}:role/cdk-*`],
            }),
          ],
        }),
      },
    });
    this.exportValue(deployRole.roleArn);
  }
}
