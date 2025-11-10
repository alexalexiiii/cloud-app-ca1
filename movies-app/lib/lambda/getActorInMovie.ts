import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event));

    const movieId = event.pathParameters?.movieid;

    if (!movieId) {
      return jsonResponse(400, { message: "Missing movie ID" });
    }

    const commandOutput = await ddbDocClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `c${movieId}` },
      })
    );

 