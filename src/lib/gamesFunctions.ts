import cheerio from "cheerio";
import moment, { Moment } from "moment";
import { Game } from "../types";

const columnMapping: any = {
  1: "dateString",
  2: "time",
  3: "court",
  6: "teamAgainst",
};

export function getNextGameAfterDate(
  games: Array<Game>,
  date: Moment
): Game | null {
  const oneWeekFromDate = date.clone().add(6, "days");
  const thisWeeksGame = games.find((game: Game) => {
    const gameDate = moment(game.dateString, "DD-MM-YY");
    return gameDate.isBetween(date, oneWeekFromDate);
  });

  if (thisWeeksGame) {
    return thisWeeksGame;
  } else {
    return null;
  }
}
/**
 * Returns an array of games given the appropriate scraped HTML
 * @param html
 * @returns Array<Game>
 */
export function extractGamesFromHTML(html: string): Array<Game> {
  const $ = cheerio.load(html);
  const table = $("tbody");
  // Initialize an empty array to store the table data
  const tableData: Array<Game> = [];

  // Iterate over each row of the table using the find and each methods
  table.find("tr").each((index, row) => {
    // Initialize an empty object to store the row data
    const rowData: any = {};

    // Iterate over each cell of the row using the find and each methods
    if (index === 0 || index === 1) {
      return;
    }

    $(row)
      .find("td")
      .each((cellIndex, cell) => {
        const key = columnMapping[cellIndex];
        if (key) {
          rowData[key] = $(cell).text().trim();
        }
      });

    // Add the row data to the table data array
    tableData.push(rowData);
  });

  /** For the dateString, we take the day of the week off the end */
  const games: Array<Game> = tableData.map((row: any) => {
    return {
      ...row,
      dateString: row.dateString.split(" ")[0],
    };
  });
  return games;
}

export function getGameInfoFromGame(game: Game): string {
  const day = moment(game.dateString, "DD-MM-YY").format("dddd");
  const time = moment(game.time, "HH:mm").format("ha");
  const { teamAgainst, court } = game;
  const output = `${day} at ${time} vs. ${teamAgainst} on ${court}`;
  return output;
}
