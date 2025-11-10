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

