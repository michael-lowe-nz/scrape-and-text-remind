import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { LeagueLobsterTextReminder } from "../src/main";
import { readFile } from "fs/promises";
import { load } from "js-yaml";
import { Team } from "../src/types";

test("Snapshot", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test");

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

test("Test that the stack builds an SNS topic", () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test");

  const template = Template.fromStack(stack);
  expect(template.hasResource("AWS::SNS::Topic", {}));
});

test("Test that the stack builds an SNS topic with the right number of subscribers in it based on the actual contacts.yml", async () => {
  const app = new App();
  const stack = new LeagueLobsterTextReminder(app, "test");

  const template = Template.fromStack(stack);
  const yaml = await readFile("./src/contacts.yml", "utf-8");
  const data: any = load(yaml);
  const numberOfContacts = data.teams.reduce(
    (totalContacts: number, team: Team) => {
      return totalContacts + team.Players.length;
    },
    0
  );
  expect(template.resourceCountIs("AWS::SNS::Subscription", numberOfContacts));
});

/**
 * I realised halfway through that a test like this would need a contacts list to be fed
 * into the stack as a prop. i.e. the stack always goes and creates its own thing
 */

// test("Test stack builds the right number of subscribers given a larger contacts list", () => {
//   const app = new App();
//   const stack = new LeagueLobsterTextReminder(app, "test");
//   const template = Template.fromStack(stack);

//   const Contacts = {
//     teams: [
//       {
//         Name: "Team 1",
//         Players: [
//           {
//             Name: "Player",
//             Number: "+6422",
//           },
//           {
//             Name: "Player2",
//             Number: "+6422",
//           },
//           {
//             Name: "Player3",
//             Number: "+6422",
//           },
//           {
//             Name: "Player4",
//             Number: "+6422",
//           },
//         ],
//       },
//       {
//         Name: "Team 2",
//         Players: [
//           {
//             Name: "Player",
//             Number: "+6422",
//           },
//           {
//             Name: "Player2",
//             Number: "+6422",
//           },
//           {
//             Name: "Player3",
//             Number: "+6422",
//           },
//           {
//             Name: "Player4",
//             Number: "+6422",
//           },
//         ],
//       },
//       {
//         Name: "Team 3",
//         Players: [
//           {
//             Name: "Player",
//             Number: "+6422",
//           },
//           {
//             Name: "Player2",
//             Number: "+6422",
//           },
//           {
//             Name: "Player3",
//             Number: "+6422",
//           },
//           {
//             Name: "Player4",
//             Number: "+6422",
//           },
//         ],
//       },
//     ],
//   };

//   expect(template.resourceCountIs("AWS::SNS::Subscription", 9));
// });
