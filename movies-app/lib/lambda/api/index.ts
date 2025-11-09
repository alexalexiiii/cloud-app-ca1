import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const ddb = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME || "";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  try {
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    const pathParams = event.pathParameters || {};
    const queryParams = event.queryStringParameters || {};

    // ---- GET MOVIE ----
    if (method === "GET" && path.match(/^\/movies\/[0-9]+$/)) {
      const movieId = pathParams.movieid || path.split("/")[2];
      const includeCast = queryParams.cast === "true";

      const movie = await ddb.send(
        new GetItemCommand({
          TableName: TABLE_NAME,
          Key: marshall({ PK: `m${movieId}`, SK: "xxxx" }),
        })
      );

      if (!movie.Item)
        return response(404, { error: "Movie not found" });

      const movieData = unmarshall(movie.Item);

      // If ?cast=true, include cast members
      if (includeCast) {
        const cast = await ddb.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: marshall({ ":pk": `c${movieId}` }),
          })
        );
        movieData.cast = cast.Items?.map((i) => unmarshall(i)) || [];
      }

      return response(200, movieData);
    }
