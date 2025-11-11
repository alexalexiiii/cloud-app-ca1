import { DynamoDBStreamHandler } from "aws-lambda";

/**
 * Lambda triggered by DynamoDB Streams.
 * Logs all INSERT, MODIFY, and REMOVE events.
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  console.log("=== DynamoDB Stream Event Received ===");

  for (const record of event.Records) {
    const eventType = record.eventName;
    const keys = record.dynamodb?.Keys;
    const oldImage = record.dynamodb?.OldImage;
    const newImage = record.dynamodb?.NewImage;

    console.log(`Event Type: ${eventType}`);
    console.log(`Primary Key: ${JSON.stringify(keys, null, 2)}`);

    switch (eventType) {
      case "INSERT":
        console.log("New item added:", JSON.stringify(newImage, null, 2));
        break;

      case "MODIFY":
        console.log("Item modified:");
        console.log("Old values:", JSON.stringify(oldImage, null, 2));
        console.log("New values:", JSON.stringify(newImage, null, 2));
        break;

      case "REMOVE":
        console.log("Item deleted:", JSON.stringify(oldImage, null, 2));
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  }

  console.log("=== Event Processing Complete ===");
};
