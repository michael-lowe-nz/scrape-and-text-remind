import { readFileSync } from "fs";
import {
  getThisWeeksGameFromHtml,
  getDataStructureFromHTML,
} from "./lib/getThisWeeksGameFromHtml";

const html = readFileSync("./src/sample-table.html", "utf-8");

test("Test the extract of games from HTML function", () => {
  const expected = {
    date: "16/05/23",
    gameInfo: "Tuesday at 9pm vs. Shesqueal O'Neal on Court 3 ",
  };
  const result = getThisWeeksGameFromHtml(html);
  return expect(result).toEqual(expected);
});

test("Test the extract of games has the correct properties", () => {
  const result = getThisWeeksGameFromHtml(html);
  expect(result).toHaveProperty("date");
  expect(result).toHaveProperty("gameInfo");
});

test("The data structure returned from the HTML is useful", () => {
  const expected = {
    Date: "02/05/23 (Tue)",
    TeamAgainst: "G-Bangers",
    Court: "Court 2",
    Time: "19:00",
  };
  const actual = getDataStructureFromHTML(html)[0];
  expect(actual).toEqual(expected);
});
