import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event));

    const body = JSON.parse(event.body || "{}");
    const { movieId, title, releaseDate, overview } = body;

    if (!movieId || !title) {
      return jsonResponse(400, { message: "Missing required movie fields" });
    }

    const item = {
      PK: `m${movieId}`,
      SK: "xxxx",
      title,
      releaseDate,
      overview,
    };

    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: item,
      })
    );
