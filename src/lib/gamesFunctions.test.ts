import { readFileSync } from "fs";
import moment from "moment";
import {
  extractGamesFromHTML,
  getGameInfoFromGame,
  getNextGameAfterDate,
} from "./gamesFunctions";
import { Game } from "../types";

const html = readFileSync("./src/lib/sample-table.html", "utf-8");

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

test("Test that the game info format can be retrieved when there are no teams", () => {
  const htmlNoTeams = readFileSync("./src/lib/sample-table-blank-teams.html", "utf-8");
  const games: Array<Game> = extractGamesFromHTML(htmlNoTeams);
  expect(Array.isArray(games)).toBeTruthy();
})