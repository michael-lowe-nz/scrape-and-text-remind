import cheerio from "cheerio";
import moment from "moment";
import { Game } from "../types";

const columnMapping: any = {
  1: "dateString",
  2: "time",
  3: "court",
  6: "teamAgainst",
};

export function getThisWeeksGameFromHtml(html: any) {
  const games = getDataStructureFromHTML(html);

  const oneWeekFromNow = moment().add(6, "days");
  const now = moment();

  const thisWeeksGame = games.find((game: Game) => {
    const gameDate = moment(game.dateString, "DD-MM-YY");
    return gameDate.isBetween(now, oneWeekFromNow);
  });

  const { dateString, time, teamAgainst, court } = thisWeeksGame;

  return {
    ...thisWeeksGame,
    // eslint-disable-next-line prettier/prettier
    // prettier-ignore
    gameInfo: `${moment(dateString, "DD-MM-YY").format("dddd")} at ${moment(time, "HH:mm").format("ha")} vs. ${teamAgainst} on ${court}`,
  };
}

export function getDataStructureFromHTML(html: string) {
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

  return tableData.map((row: any) => {
    return {
      ...row,
      dateString: row.dateString.split(" ")[0],
    };
  });
}
