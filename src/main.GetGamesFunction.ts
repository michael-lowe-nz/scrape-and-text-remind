import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { Handler } from "aws-lambda";
import axios from "axios";
import { getRandomEmoji } from "./lib/getRandomEmoji";
import { getThisWeeksGameFromHtml } from "./lib/getThisWeeksGameFromHtml";

export const handler: Handler = async () => {
  const client = new SNSClient({ region: process.env.AWS_REGION });
  const url = `https://websites.mygameday.app/team_info.cgi?c=0-2854-0-622183-27083591&a=SFIX`;
  const requestResponse: any = await axios.get(url);
  const gameData = getThisWeeksGameFromHtml(requestResponse.data);
  // eslint-disable-next-line prettier/prettier
  // prettier-ignore
  const Message = (`🏀 Gen-X Reminders 🏀
 Hey guys! Game is at ${gameData.gameInfo} ${getRandomEmoji()}${getRandomEmoji()}${getRandomEmoji()}`);
  const params = {
    Message,
    TopicArn: process.env.SNS_TOPIC_ARN,
    DefaultSMSType: "Promotional",
  };
  const response = await client.send(new PublishCommand(params));
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
