import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event));

    const { movie, actor, awardBody } = event.queryStringParameters || {};

    if (!movie && !actor) {
      return jsonResponse(400, { message: "movie or actor required" });
    }

    const pk = movie ? `w${movie}` : `w${actor}`;
    let params: any = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": pk },
    };

    if (awardBody) {
      params.KeyConditionExpression += " and SK = :sk";
      params.ExpressionAttributeValues[":sk"] = awardBody;
    }
    const commandOutput = await ddbDocClient.send(new QueryCommand(params));
    return jsonResponse(200, { data: commandOutput.Items || [] });
  } catch (error: any) {
    console.error("Error:", error);
    return jsonResponse(500, { error: error.message });
  }
};
// respnse code helper ^^
function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

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

