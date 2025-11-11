import { Aws, Duration } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import { Table } from "aws-cdk-lib/aws-dynamodb";

type AppApiProps = {
  userPoolId: string;
  userPoolClientId: string;
  table: Table; 
};

export class AppApi extends Construct {
  constructor(scope: Construct, id: string, props: AppApiProps) {
    super(scope, id);

    // ─── API Gateway ───────────────────────────────────────────────────────────
    const appApi = new apig.RestApi(this, "AppApi", {
      description: "Application API for movies and protected endpoints",
      endpointTypes: [apig.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: apig.Cors.ALL_ORIGINS,
        allowMethods: apig.Cors.ALL_METHODS,
      },
    });

    // ─── Common Lambda Configuration ───────────────────────────────────────────
    const appCommonFnProps = {
      architecture: lambda.Architecture.ARM_64,
      timeout: Duration.seconds(10),
      memorySize: 128,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {
        USER_POOL_ID: props.userPoolId,
        CLIENT_ID: props.userPoolClientId,
        REGION: Aws.REGION,
        TABLE_NAME: props.table.tableName, 
      },
    };

    // ─── Authorizer ────────────────────────────────────────────────────────────
    const authorizerFn = new node.NodejsFunction(this, "AuthorizerFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../../lambda/auth/authorizer.ts`,
    });

    const requestAuthorizer = new apig.RequestAuthorizer(
      this,
      "RequestAuthorizer",
      {
        identitySources: [apig.IdentitySource.header("cookie")],
        handler: authorizerFn,
        resultsCacheTtl: Duration.minutes(0),
      }
    );

    // ─── Public + Protected Routes ─────────────────────────────────────────────
    const publicFn = new node.NodejsFunction(this, "PublicFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../../lambda/public.ts`,
    });

    const protectedFn = new node.NodejsFunction(this, "ProtectedFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../../lambda/protected.ts`,
    });

    const publicRes = appApi.root.addResource("public");
    publicRes.addMethod("GET", new apig.LambdaIntegration(publicFn));

    const protectedRes = appApi.root.addResource("protected");
    protectedRes.addMethod("GET", new apig.LambdaIntegration(protectedFn), {
      authorizer: requestAuthorizer,
      authorizationType: apig.AuthorizationType.CUSTOM,
    });

// ─── Movies and Awards Routes ────────────────────────────────────────────────
const movies = appApi.root.addResource("movies");
const movie = movies.addResource("{movieid}");
const awards = appApi.root.addResource("awards");

// ✅ Use correct file paths (no /movies/ folder)
const listMoviesFn = new node.NodejsFunction(this, "ListMoviesFn", {
  ...appCommonFnProps,
  entry: `${__dirname}/../../lambda/getMovie.ts`, // or get all movies file if you have one
});

const getMovieFn = new node.NodejsFunction(this, "GetMovieFn", {
  ...appCommonFnProps,
  entry: `${__dirname}/../../lambda/getMovieById.ts`,
});

const postMovieFn = new node.NodejsFunction(this, "PostMovieFn", {
  ...appCommonFnProps,
  entry: `${__dirname}/../../lambda/postMovie.ts`,
});

const deleteMovieFn = new node.NodejsFunction(this, "DeleteMovieFn", {
  ...appCommonFnProps,
  entry: `${__dirname}/../../lambda/deleteMovie.ts`,
});

const getActorsFn = new node.NodejsFunction(this, "GetActorsFn", {
  ...appCommonFnProps,
  entry: `${__dirname}/../../lambda/getActorsInMovie.ts`,
});

const getAwardsFn = new node.NodejsFunction(this, "GetAwardsFn", {
  ...appCommonFnProps,
  entry: `${__dirname}/../../lambda/getAwards.ts`,
});

// Grant DynamoDB access
props.table.grantReadData(listMoviesFn);
props.table.grantReadData(getMovieFn);
props.table.grantWriteData(postMovieFn);
props.table.grantWriteData(deleteMovieFn);
props.table.grantReadData(getActorsFn);
props.table.grantReadData(getAwardsFn);

// define API routes
movies.addMethod("GET", new apig.LambdaIntegration(listMoviesFn));
movies.addMethod("POST", new apig.LambdaIntegration(postMovieFn));
movie.addMethod("GET", new apig.LambdaIntegration(getMovieFn));
movie.addMethod("DELETE", new apig.LambdaIntegration(deleteMovieFn));
movie.addResource("actors").addMethod("GET", new apig.LambdaIntegration(getActorsFn));
awards.addMethod("GET", new apig.LambdaIntegration(getAwardsFn));
  }
}
