import { Stack, StackProps } from "aws-cdk-lib";
import {
  // Role,
  // WebIdentityPrincipal,
  // PolicyDocument,
  // Effect,
  // PolicyStatement,
  OpenIdConnectProvider,
} from "aws-cdk-lib/aws-iam";
import { GitHubActionRole } from "cdk-pipelines-github";
import { Construct } from "constructs";

export class OIDCSetup extends Stack {
  // role: Role;
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    const githubProvider = new OpenIdConnectProvider(
      this,
      "GithubOIDCProvider",
      {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
        thumbprints: [
          "6938fd4d98bab03faadb97b34396831e3780aea1",
          "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
        ],
      }
    );

    const deployRole = new GitHubActionRole(this, "github-action-role", {
      repos: ["michael-lowe-nz/scrape-and-text-remind"],
      provider: githubProvider,
    });

    this.exportValue(deployRole.role.roleArn);
  }
}
