import { awscdk } from "projen";
import {
  JestReporter,
  UpgradeDependenciesSchedule,
} from "projen/lib/javascript";

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  name: "league-lobster-text-reminders",
  gitignore: ["src/contacts.yml"],
  eslint: true,
  prettier: true,
  deps: [
    "@types/js-yaml",
    "js-yaml",
    "@aws-sdk/client-sns",
    "cdk-pipelines-github",
    "cheerio@^1.1.2",
    "@types/cheerio",
    "@types/axios",
    "@types/aws-lambda",
    "axios",
    "moment",
    "jest-html-reporters",
    "cdk-nag",
  ] /* Runtime dependencies of this module. */,
  description: "Send Text Reminders based on a lambda scrape and approval",
  jestOptions: {
    preserveDefaultReporters: true,
    jestConfig: {
      reporters: [
        new JestReporter("jest-html-reporters", {
          publicPath: "./test-reports",
          inlineSource: true,
        }),
        new JestReporter("github-actions"),
      ],
    },
  },
  devDeps: [
    "@mermaid-js/mermaid-cli",
  ] /* Build dependencies for this module. */,
  packageName:
    "league-lobster-text-reminders" /* The "name" in package.json. */,
  lambdaOptions: {
    bundlingOptions: {
      externals: ["@aws-cdk/client-sns"],
    },
  },
  githubOptions: {
    pullRequestLint: false,
  },
  pullRequestTemplateContents: [
    `## Description`,
    `<!--- Describe your changes in detail -->`,
    `## Checklist:`,
    `- [ ] The project can be synthesised without error \`npm run snyth\``,
    `- [ ] My change requires a change to the documentation.`,
    `- [ ] I have updated the documentation accordingly.`,
  ],
  postBuildSteps: [
    {
      name: "Upload Test Reports",
      uses: "actions/upload-artifact@v4",
      with: {
        name: "test-reports",
        path: "test-reports",
      },
    },
    {
      name: "Upload CDK Nag Report",
      uses: "actions/upload-artifact@v4",
      with: {
        name: "cdk-nag-report",
        path: "cdk.out/",
      },
    },
  ],
  autoMergeOptions: {
    approvedReviews: 0,
  },
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.expressions(["0 0 * * 2,4,6"]),
    },
  },
  projenrcTs: true,
});

// Add custom tasks for generating architecture diagrams
project.addTask("diagram", {
  description: "Generate architecture diagram from Mermaid",
  exec: "mmdc -i architecture-diagram.md -o docs/architecture-diagram.png -t dark -b transparent",
});

project.addTask("diagram:svg", {
  description: "Generate architecture diagram as SVG",
  exec: "mmdc -i architecture-diagram.md -o docs/architecture-diagram.svg -t dark -b transparent",
});

project.addTask("docs", {
  description: "Generate all documentation diagrams",
  exec: "mkdir -p docs && npm run diagram && npm run diagram:svg",
});

project.synth();
