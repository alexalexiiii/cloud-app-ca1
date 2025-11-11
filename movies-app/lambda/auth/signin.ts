import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: process.env.REGION });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    const body = event.body ? JSON.parse(event.body) : {};

    if (!body.username || !body.password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing username or password" }),
      };
    }

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.CLIENT_ID!,
      AuthParameters: {
        USERNAME: body.username,
        PASSWORD: body.password,
      },
    });

    const { AuthenticationResult } = await client.send(command);

    if (!AuthenticationResult) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid credentials" }),
      };
    }

    const token = AuthenticationResult.IdToken;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Set-Cookie": `token=${token}; SameSite=None; Secure; HttpOnly; Path=/; Max-Age=3600;`,
      },
      body: JSON.stringify({
        message: "Auth successful",
        token,
      }),
    };
  } catch (err: any) {
    console.error("[ERROR]", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message || "Internal Server Error" }),
    };
  }
};
