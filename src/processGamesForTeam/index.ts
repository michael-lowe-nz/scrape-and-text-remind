import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { Handler } from "aws-lambda";
import axios from "axios";
// import { getRandomEmoji } from "./lib/getRandomEmoji";
import moment from "moment";
import {
  extractGamesFromHTML,
  getNextGameAfterDate,
  getGameInfoFromGame,
} from "../lib/gamesFunctions";
import { Game } from "../types";

const url = process.env.SCHEDULE_URL;

export const handler: Handler = async () => {
  const client = new SNSClient({ region: process.env.AWS_REGION });

  const teamName = process.env.TEAM_NAME;

  /**
   * @todo should be an environment variable
   */

  console.log("URL", url);

  const requestResponse: any = await axios.get(url || "");
  const games: Array<Game> = extractGamesFromHTML(requestResponse.data);
  console.log("GAMES:");
  console.log(games);
  const nextGame: Game | null = getNextGameAfterDate(games, moment());

  if (!nextGame) {
    const Message = `Ok, looks like we can't find a game for ${teamName} the coming week. You might want to check what is going on! 👀`;
    const params = {
      Message,
      TopicArn: process.env.SNS_ADMIN_TOPIC_ARN,
      DefaultSMSType: "Promotional",
    };
    const response = await client.send(new PublishCommand(params));
    console.log("No game message sent");
    console.log(response);
    return {
      statusCode: 200,
      body: {
        message: "No game coming up this week",
      },
    };
  }

  const gameInfo: string = getGameInfoFromGame(nextGame);
  const Message = `🏀 ${teamName} Reminders 🏀\nHey guys! Game is on ${gameInfo}`;
  const params = {
    Message,
    TopicArn: process.env.SNS_TOPIC_ARN,
    DefaultSMSType: "Promotional",
  };
  console.log("Game Message Sent:");
  console.log(Message);
  const response = await client.send(new PublishCommand(params));
  return {
    statusCode: 200,
    body: { snsResponse: response, message: Message },
  };
};
