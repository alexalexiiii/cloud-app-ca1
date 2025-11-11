import {
  Stack,
  StackProps,
  aws_lambda as lambda,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigw,
  aws_iam as iam,
  aws_cognito as cognito,
  aws_logs as logs,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

interface ApiStackProps extends StackProps {
  table: dynamodb.Table;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  logGroup: logs.LogGroup;
}

// Stack defines all Lambda functions and API Gateway routes for the Movies App
export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { table, userPool, userPoolClient, logGroup } = props;

    // IAM role for Lambda functions
    const lambdaRole = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });
    table.grantReadWriteData(lambdaRole);

    // Get Movie by ID
    const getMovieFn = new lambdaNode.NodejsFunction(this, "GetMovieFn", {
      entry: path.join(__dirname, "../../lambda/getMovie.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: { TABLE_NAME: table.tableName, REGION: cdk.Aws.REGION },
      role: lambdaRole,
    });
    table.grantReadData(getMovieFn);

    // Get Awards
    const getAwardsFn = new lambdaNode.NodejsFunction(this, "GetAwardsFn", {
      entry: path.join(__dirname, "../../lambda/getAwards.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: { TABLE_NAME: table.tableName, REGION: cdk.Aws.REGION },
      role: lambdaRole,
    });
    table.grantReadData(getAwardsFn);

    // Add Movie (POST)
    const postMovieFn = new lambdaNode.NodejsFunction(this, "PostMovieFn", {
      entry: path.join(__dirname, "../../lambda/postMovie.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: { TABLE_NAME: table.tableName, REGION: cdk.Aws.REGION },
      role: lambdaRole,
    });
    table.grantWriteData(postMovieFn);

    // Delete Movie
    const deleteMovieFn = new lambdaNode.NodejsFunction(this, "DeleteMovieFn", {
      entry: path.join(__dirname, "../../lambda/deleteMovie.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: { TABLE_NAME: table.tableName, REGION: cdk.Aws.REGION },
      role: lambdaRole,
    });
    table.grantWriteData(deleteMovieFn);

    // Signin Lambda
    const signinFn = new lambdaNode.NodejsFunction(this, "SigninFn", {
      entry: path.join(__dirname, "../../lambda/auth/signin.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {
        REGION: cdk.Aws.REGION,
        CLIENT_ID: userPoolClient.userPoolClientId,
      },
      role: lambdaRole,
    });

    // Signout Lambda
    const signoutFn = new lambdaNode.NodejsFunction(this, "SignoutFn", {
      entry: path.join(__dirname, "../../lambda/auth/signout.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      role: lambdaRole,
    });

    // API Gateway
    const api = new apigw.RestApi(this, "MoviesApi", {
      restApiName: "Movies REST API",
      deployOptions: {
        stageName: "dev",
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    });

    // Cognito authorizer for authenticated routes
    const authorizer = new apigw.CognitoUserPoolsAuthorizer(
      this,
      "MoviesAuthorizer",
      {
        cognitoUserPools: [userPool],
      }
    );

    // API key and usage plan for admin-only operations
    const apiKey = api.addApiKey("AdminApiKey");
    const usagePlan = api.addUsagePlan("AdminUsagePlan", {
      apiStages: [{ api, stage: api.deploymentStage }],
    });
    usagePlan.addApiKey(apiKey);

    // API resources
    const movies = api.root.addResource("movies");
    const movie = movies.addResource("{movieid}");
    const awards = api.root.addResource("awards");
    const signin = api.root.addResource("signin");
    const signout = api.root.addResource("signout");

    // GET /movies/{movieid} (requires authentication)
    movie.addMethod("GET", new apigw.LambdaIntegration(getMovieFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // GET /awards (requires authentication)
    awards.addMethod("GET", new apigw.LambdaIntegration(getAwardsFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // POST /movies (admin-only)
    movies.addMethod("POST", new apigw.LambdaIntegration(postMovieFn), {
      apiKeyRequired: true,
    });

    // DELETE /movies/{movieid} (admin-only)
    movie.addMethod("DELETE", new apigw.LambdaIntegration(deleteMovieFn), {
      apiKeyRequired: true,
    });

    // Authentication endpoints
    signin.addMethod("POST", new apigw.LambdaIntegration(signinFn));
    signout.addMethod("GET", new apigw.LambdaIntegration(signoutFn));

    // Outputs for stack
    new cdk.CfnOutput(this, "MoviesApiUrl", { value: api.url ?? "" });
    new cdk.CfnOutput(this, "AdminApiKey", { value: apiKey.keyId });
  }
}
