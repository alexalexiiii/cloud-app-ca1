import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Initialization
const ddbDocClient = createDDbDocClient();

// Create DynamoDB Document Client
function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({});
  return DynamoDBDocumentClient.from(ddbClient);
}

// Handler for missing movie id or movie not found
export const handler: Handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event));

    const movieId = event.pathParameters?.movieid;

    if (!movieId) {
      return jsonResponse(400, { message: "Missing movie ID" });
    }

    const commandOutput = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: `m${movieId}`, SK: "xxxx" },
      })
    );

    if (!commandOutput.Item) {
      return jsonResponse(404, { message: "Movie not found" });
    }

