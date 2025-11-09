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

    // ---- GET ALL ACTORS IN A MOVIE ----
    if (method === "GET" && path.match(/^\/movies\/[0-9]+\/actors$/)) {
      const movieId = pathParams.movieid || path.split("/")[2];

      const cast = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: marshall({ ":pk": `c${movieId}` }),
        })
      );

      return response(200, cast.Items?.map((i) => unmarshall(i)) || []);
    }

    // ---- GET SPECIFIC ACTOR IN A MOVIE ----
    if (method === "GET" && path.match(/^\/movies\/[0-9]+\/actors\/[0-9]+$/)) {
      const movieId = pathParams.movieid || path.split("/")[2];
      const actorId = pathParams.actorid || path.split("/")[4];

      const castMember = await ddb.send(
        new GetItemCommand({
          TableName: TABLE_NAME,
          Key: marshall({ PK: `c${movieId}`, SK: actorId }),
        })
      );

      if (!castMember.Item)
        return response(404, { error: "Cast member not found" });

      return response(200, unmarshall(castMember.Item));
    }

    // ---- GET AWARDS ----
    if (method === "GET" && path.startsWith("/awards")) {
      const { movie, actor, awardBody } = queryParams;

      let key = "";
      if (movie) key = `w${movie}`;
      else if (actor) key = `w${actor}`;
      else return response(400, { error: "movie or actor required" });

      let params: any = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: marshall({ ":pk": key }),
      };

      if (awardBody) params.KeyConditionExpression += " and SK = :sk", 
      params.ExpressionAttributeValues[":sk"] = awardBody;

      const awards = await ddb.send(new QueryCommand(params));
      return response(200, awards.Items?.map((i) => unmarshall(i)) || []);
    }

        // ---- POST MOVIE (Admin only) ----
    if (method === "POST" && path === "/movies") {
      const body = JSON.parse(event.body || "{}");
      const newMovie = {
        PK: `m${body.movieId}`,
        SK: "xxxx",
        title: body.title,
        releaseDate: body.releaseDate,
        overview: body.overview,
      };

      await ddb.send(
        new PutItemCommand({
          TableName: TABLE_NAME,
          Item: marshall(newMovie),
        })
      );

      return response(201, { message: "Movie added", movie: newMovie });
    }

    // ---- DELETE MOVIE (Admin only) ----
    if (method === "DELETE" && path.match(/^\/movies\/[0-9]+$/)) {
      const movieId = pathParams.movieid || path.split("/")[2];
      await ddb.send(
        new DeleteItemCommand({
          TableName: TABLE_NAME,
          Key: marshall({ PK: `m${movieId}`, SK: "xxxx" }),
        })
      );
      return response(200, { message: `Movie ${movieId} deleted` });
    }

    // ---- Unknown ----
    return response(404, { error: "Endpoint not found" });

  } catch (err: any) {
    console.error("❌ Error:", err);
    return response(500, { error: err.message || "Server error" });
  }
};

const response = (statusCode: number, body: any) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

// Helper function to unmarshall DynamoDB items
const unmarshallItem = (item: any) => {
  return item ? unmarshall(item) : null;
};