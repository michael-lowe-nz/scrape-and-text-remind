import { readFileSync } from "fs";
import moment from "moment";
import {
  extractGamesFromHTML,
  getGameInfoFromGame,
  getNextGameAfterDate,
} from "./lib/gamesFunctions";
import { Game } from "./types";

const html = readFileSync("./src/sample-table.html", "utf-8");

test("Test the extract of games data from HTML function", () => {
  const expected: Game = {
    court: "Court 2",
    teamAgainst: "G-Bangers",
    time: "19:00",
    dateString: "02/05/23",
  };
  const result = extractGamesFromHTML(html);
  expect(result.length).toBeGreaterThan(0);
  expect(result[0]).toStrictEqual(expected);
});

test("Test that the next Game is returned correctly given a date", () => {
  //act
  const games: Array<Game> = extractGamesFromHTML(html);
  const expected: Game = {
    court: "Court 3",
    teamAgainst: "Shesqueal O'Neal",
    time: "21:00",
    dateString: "16/05/23",
  };
  const actual = getNextGameAfterDate(games, moment("14/5/23", "DD-MM-YY"));
  expect(actual).toStrictEqual(expected);
});

test("Test that the game info format can be retrieved from a game", () => {
  const game: Game = {
    court: "Court 3",
    teamAgainst: "Shesqueal O'Neal",
    time: "21:00",
    dateString: "16/05/23",
  };
  const expected = "Tuesday at 9pm vs. Shesqueal O'Neal on Court 3";
  const result = getGameInfoFromGame(game);
  expect(result).toEqual(expected);
});
// test("Test the extract of games has the correct game info", () => {
//   const result = getThisWeeksGameFromHtml(html);
//   expect(result?.gameInfo).toEqual(
//     "Tuesday at 9pm vs. Shesqueal O'Neal on Court 3"
//   );
// });

// test("The data structure returned from the HTML is useful", () => {
//   const expected = {
//     dateString: "02/05/23",
//     teamAgainst: "G-Bangers",
//     court: "Court 2",
//     time: "19:00",
//   };
//   const actual = getDataStructureFromHTML(html)[0];
//   expect(actual).toEqual(expected);
// });

// Functions
// Get data from html - get a [<game>,<game>] structure from the html
// Return the nextGame from date  [<game>,<game>] - the first game from within 7 days of the given date
// Give me a game, and I'll give you a "gameInfo" string
