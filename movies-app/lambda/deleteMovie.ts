import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event));

    const movieId = event.pathParameters?.movieid;
    if (!movieId) {
      return jsonResponse(400, { message: "Missing movie ID" });
    }

    await ddbDocClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: `m${movieId}`, SK: "xxxx" },
      })
    );
// success response after deletion
    return jsonResponse(200, { message: `Movie ${movieId} deleted` });
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
