import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { CognitoIdentityProviderClient, SignUpCommand, SignUpCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../../lib/shared/types-schema.json"; 


const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const isValidBodyParams = ajv.compile(schema.definitions["SignUpBody"] || {});

const client = new CognitoIdentityProviderClient({ region: process.env.REGION });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", event);

    const body = event.body ? JSON.parse(event.body) : undefined;
    if (!isValidBodyParams(body)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid signup payload",
          schema: schema.definitions["SignUpBody"],
        }),
      };
    }

    const params: SignUpCommandInput = {
      ClientId: process.env.CLIENT_ID!,
      Username: body.username as string,
      Password: body.password as string,
      UserAttributes: [{ Name: "email", Value: body.email as string }],
    };

    const command = new SignUpCommand(params);
    const res = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Signup successful",
        data: res,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (err as Error).message }),
    };
  }
};
