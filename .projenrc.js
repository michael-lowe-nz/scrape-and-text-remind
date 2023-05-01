const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'league-lobster-text-reminders',
  gitignore: ['src/contacts.yml'],
  eslint: false,
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    '@types/js-yaml',
    'js-yaml',
    'cdk-pipelines-github@0.4.47'
  ],             /* Build dependencies for this module. */
  packageName: "league-lobster-text-reminders",  /* The "name" in package.json. */
});

project.synth();