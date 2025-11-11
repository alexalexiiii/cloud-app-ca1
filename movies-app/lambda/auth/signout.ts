import { APIGatewayProxyResult } from "aws-lambda";

exports.handler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Set-Cookie":
        "token=x; SameSite=None; Secure; HttpOnly; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;",
    },
    body: JSON.stringify({ message: "Signout successful" }),
  };
};
// Lambda function to handle user sign-out by clearing the authentication cookie