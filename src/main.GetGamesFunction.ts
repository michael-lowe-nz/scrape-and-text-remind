import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
// import axios from "axios";
import { getRandomEmoji } from "./lib/getRandomEmoji";

exports.handler = async () => {
  const client = new SNSClient({ region: process.env.AWS_REGION });
  const date = new Date();
  // const url = `https://websites.mygameday.app/team_info.cgi?c=0-2854-0-622183-27083591&a=SFIX`;
  // const data = await axios.get(url);
  // console.log(data);

  const Message = `Gen-X Reminders: Game vs. ${date.toString()}${getRandomEmoji()} `;
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
