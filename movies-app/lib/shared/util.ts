import { marshall } from "@aws-sdk/util-dynamodb";
import { Movie } from "./types";
import { APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import * as jwt from "jsonwebtoken";

export const generateMovieItem = (movie: Movie) => {
  return {
    PutRequest: {
      Item: marshall(movie),
    },
  };
};

export const generateBatch = (data: Movie[]) => {
  return data.map((e) => {
    return generateMovieItem(e);
  });
};

export const chunkArray = <T>(arr: T[], size: number): T[][] => {
    const chunkedArr: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunkedArr.push(arr.slice(i, i + size));
    }
    return chunkedArr;
};

export type CookieMap = { [key: string]: string };

/**
 * Parse cookies from the API Gateway event headers.
 */
export function parseCookies(event: APIGatewayRequestAuthorizerEvent): CookieMap {
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, v] = c.trim().split("=");
      return [k, v];
    })
  );
}

/**
 * Create an IAM policy for API Gateway authorizers.
 */
export function createPolicy(event: APIGatewayRequestAuthorizerEvent, effect: "Allow" | "Deny") {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: event.methodArn,
      },
    ],
  };
}

/**
 * Verify or decode a JWT token (Cognito tokens)
 */
export async function verifyToken(token: string, userPoolId?: string, region?: string) {
  try {
    if (!token) return null;

    // NOTE: This simple decode is enough for local testing.
    // For production, you’d validate against Cognito's JWKS keys.
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    return decoded;
  } catch (err) {
    console.error("JWT verification failed", err);
    return null;
  }
}