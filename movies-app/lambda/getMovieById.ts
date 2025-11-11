import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Initialization
const ddbDocClient = createDDbDocClient();

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({});
  return DynamoDBDocumentClient.from(ddbClient);
}

// Handler
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

    return jsonResponse(200, { data: commandOutput.Item });
  } catch (error: any) {
    console.error("Error:", error);
    return jsonResponse(500, { error: error.message });
  }
};

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}
