/**
 * references for function structure
 * https://cdkworkshop.com
 * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html
 */
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as eventSources from 'aws-cdk-lib/aws-lambda-event-sources';


export class MoviesAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   const table = new dynamodb.Table(this, 'SingleTable', {
    partitionKey: {name: 'PK', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.DESTROY,
    stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
   });

   const apiHandler = new lambda.Function(this, 'ApiHandler', {
    runtime: lambda.Runtime.NODEJS_18_X,
    code: lambda.Code.fromAsset('lambda/api'),
    handler: 'index.handler',
    environment: { TABLE_NAME: table.tableName}
   });
   table.grantReadWriteData(apiHandler);

   const stateLogger = new lambda.Function(this, 'StateLogger', {
    runtime: lambda.Runtime.NODEJS_18_X,
    code: lambda.Code.fromAsset('lambda/stateLogger'),
    handler: 'index.handler'
   });
   stateLogger.addEventSource(new eventSources.DynamoEventSource(table, {
    startingPosition: lambda.StartingPosition.TRIM_HORIZON,
    batchSize: 5
   }));

   const userPool = new cognito.UserPool(this, 'UserPool', { selfSignUpEnabled: true, signInAliases: { email: true } });
   const userPoolClient = new cognito.UserPoolClient(this, 'AppClient', { userPool });

   const api = new apigw.RestApi(this, 'MoviesApi', {
    restApiName: 'Movies REST Api',
    deployOptions: {
      stageName: 'dev',
      loggingLevel: apigw.MethodLoggingLevel.INFO,
      dataTraceEnabled: true
    }
   });


  }
}
