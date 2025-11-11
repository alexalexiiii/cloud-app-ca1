import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { AuthApi } from "../constructs/auth-api";
import { AppApi } from "../constructs/app-api";

export class CognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1️Create the Cognito user pool
    const userPool = new UserPool(this, "MoviesUserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true, username: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolId = userPool.userPoolId;

    //  Add an app client (used by sign-in lambda)
    const appClient = userPool.addClient("MoviesAppClient", {
      authFlows: { userPassword: true },
    });

    const userPoolClientId = appClient.userPoolClientId;

    // 3️Deploy the Auth API (signup, signin, signout, confirm)
    new AuthApi(this, "AuthServiceApi", {
      userPoolId,
      userPoolClientId,
    });

    // Deploy the App API (protected/public endpoints)
    new AppApi(this, "AppApi", {
      userPoolId,
      userPoolClientId,
    });
  }
}
