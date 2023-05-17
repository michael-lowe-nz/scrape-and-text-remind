import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { Handler } from "aws-lambda";
import axios from "axios";
// import { getRandomEmoji } from "./lib/getRandomEmoji";
import moment from "moment";
import {
  extractGamesFromHTML,
  getNextGameAfterDate,
  getGameInfoFromGame,
} from "./lib/gamesFunctions";
import { Game } from "./types";

export const handler: Handler = async () => {
  const client = new SNSClient({ region: process.env.AWS_REGION });

  /**
   * @todo should be an environment variable
   */
  const url = `https://websites.mygameday.app/team_info.cgi?c=0-2854-0-622183-27083591&a=SFIX`;

  const requestResponse: any = await axios.get(url);
  const games: Array<Game> = extractGamesFromHTML(requestResponse.data);
  const nextGame: Game | null = getNextGameAfterDate(games, moment());

  if (!nextGame) {
    return {
      statusCode: 200,
      body: {
        message: "No game coming up this week",
      },
    };
  }

  const gameInfo: string = getGameInfoFromGame(nextGame);
  const Message = `🏀 Gen-X Reminders 🏀\nHey guys! Game is on ${gameInfo}`;
  const params = {
    Message,
    TopicArn: process.env.SNS_TOPIC_ARN,
    DefaultSMSType: "Promotional",
  };
  const response = await client.send(new PublishCommand(params));
  return {
    statusCode: 200,
    body: JSON.stringify({ snsResponse: response, message: Message }),
  };
};
