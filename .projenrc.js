const { awscdk } = require("projen");
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  name: "league-lobster-text-reminders",
  gitignore: ["src/contacts.yml"],
  eslint: true,
  prettier: true,
  deps: [
    "@types/js-yaml@4.0.5",
    "js-yaml",
    "@aws-sdk/client-sns",
    "cdk-pipelines-github",
    "cheerio@latest",
    "@types/cheerio",
    "@types/axios",
    "@types/aws-lambda",
    "axios",
    "moment",
    "jest-html-reporters",
  ] /* Runtime dependencies of this module. */,
  description: "Send Text Reminders based on a lambda scrape and approval",
  jestOptions: {
    preserveDefaultReporters: true,
    jestConfig: {
      reporters: [
        "default",
        [
          "jest-html-reporters",
          {
            publicPath: "./test-reports",
            inlineSource: true,
          },
        ],
        "github-actions",
      ],
    },
  },
  devDeps: [] /* Build dependencies for this module. */,
  packageName:
    "league-lobster-text-reminders" /* The "name" in package.json. */,
  lambdaOptions: {
    externals: ["@aws-cdk/client-sns"],
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
      uses: "actions/upload-artifact@v3",
      with: {
        name: "test-reports",
        path: "test-reports",
      },
    },
  ],
  autoMergeOptions: {
    approvedReviews: 0,
  }
});

project.synth();
