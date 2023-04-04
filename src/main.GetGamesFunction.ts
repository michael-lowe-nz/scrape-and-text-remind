import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { getRandomEmoji } from "./lib/getRandomEmoji";

exports.handler = async () => {
  const client = new SNSClient({ region: process.env.AWS_REGION });
  const date = new Date();
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
