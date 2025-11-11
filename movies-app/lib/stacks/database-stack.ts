import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as path from "path";

export class DatabaseStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create DynamoDB table
    this.table = new dynamodb.Table(this, "SingleTable", {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // create lambda to process stream records
    const stateChangeLoggerFn = new lambdaNode.NodejsFunction(
      this,
      "StateChangeLoggerFn",
      {
        entry: path.join(__dirname, "../../lambda/stateLogger/index.ts"),
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "handler",
        environment: {
          TABLE_NAME: this.table.tableName,
        },
      }
    );

    // connect the DynamoDB stream to the Lambda
    stateChangeLoggerFn.addEventSource(
      new lambdaEventSources.DynamoEventSource(this.table, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 5,
        retryAttempts: 2,
      })
    );

    // grsant stream read perms to lambda
    this.table.grantStreamRead(stateChangeLoggerFn);
  }
}
