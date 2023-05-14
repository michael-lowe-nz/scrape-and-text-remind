import cheerio from "cheerio";
import moment from "moment";

const columnMapping: any = {
  1: "Date",
  2: "Time",
  3: "Court",
  6: "TeamAgainst",
};

export function getThisWeeksGameFromHtml(html: any) {
  const $ = cheerio.load(html);

  const table = $("tbody");

  // Initialize an empty array to store the table data
  const tableData: any = [];

  // Iterate over each row of the table using the find and each methods
  table.find("tr").each((_i, row) => {
    // Initialize an empty object to store the row data
    const rowData: any = {};

    // Iterate over each cell of the row using the find and each methods
    $(row)
      .find("td, th")
      .each((j, cell) => {
        // Add the cell data to the row data object
        rowData[$(cell).text()] = j;
      });

    // Add the row data to the table data array
    tableData.push(rowData);
  });

  const oneWeekFromNow = moment().add(6, "days");
  const now = moment();

  // Remove the top two rows, they are junk
  tableData.splice(0, 2);
  const cleaned = tableData.map((row: any) => {
    const keys = Object.keys(row);
    const time = keys[2];
    const date = keys[1].split(" ")[0];
    return {
      gameInfo: `${moment(date, "DD-MM-YY").format("dddd")} at ${moment(
        time,
        "HH:mm"
      ).format("ha")} vs. ${keys[5]} on ${keys[3]}`,
      date,
    };
  });

  const correct = cleaned.find((item: any) => {
    const gameDate = moment(item.date, "DD-MM-YY");
    return gameDate.isBetween(now, oneWeekFromNow);
  });
  return correct;
}

export function getDataStructureFromHTML(html: string) {
  const $ = cheerio.load(html);

  const table = $("tbody");

  // Initialize an empty array to store the table data
  const tableData: any = [];

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

  return tableData;
}
