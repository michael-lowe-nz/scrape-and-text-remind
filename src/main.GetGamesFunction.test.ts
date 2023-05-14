import { readFileSync } from "fs";
import {
  getThisWeeksGameFromHtml,
  getDataStructureFromHTML,
} from "./lib/getThisWeeksGameFromHtml";
import { Game } from "./types";

const html = readFileSync("./src/sample-table.html", "utf-8");

test("Test the extract of games from HTML function", () => {
  const expected: Game = {
    gameInfo: "Tuesday at 9pm vs. Shesqueal O'Neal on Court 3",
    court: "Court 3",
    teamAgainst: "Shesqueal O'Neal",
    time: "21:00",
    dateString: "16/05/23",
  };
  const result = getThisWeeksGameFromHtml(html);
  return expect(result).toStrictEqual(expected);
});

test("Test the extract of games has the correct game info", () => {
  const result = getThisWeeksGameFromHtml(html);
  expect(result.gameInfo).toEqual(
    "Tuesday at 9pm vs. Shesqueal O'Neal on Court 3"
  );
});

test("The data structure returned from the HTML is useful", () => {
  const expected = {
    dateString: "02/05/23",
    teamAgainst: "G-Bangers",
    court: "Court 2",
    time: "19:00",
  };
  const actual = getDataStructureFromHTML(html)[0];
  expect(actual).toEqual(expected);
});
