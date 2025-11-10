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

    return jsonResponse(201, { message: "Movie added", data: item });
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

// ddc client function for marshalling/unmarshalling
function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = { wrapNumbers: false };
  return DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions,
    unmarshallOptions,
  });
}
