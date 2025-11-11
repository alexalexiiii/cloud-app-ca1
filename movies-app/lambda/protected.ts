import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log("[PROTECTED EVENT]", JSON.stringify(event));

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: "This is a protected endpoint — you are authenticated!",
      event,
    }),
  };
};
