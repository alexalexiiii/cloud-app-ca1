## Assignment - Cloud App Development.

__Name:__  Alexandra Dinea

### Links.
__Demo:__ https://youtu.be/ntk75g-HxWk

### Screenshots.

Web App API, as seen from the AWS management console.

![appapi](appapi.png)

Seeded DynamoDB table
![db](databasestack.png)


CloudWatch state change logger logs, from real modify events to generate logs
![logs](cloudwatchlogging.png)

###  Extra 

- The application defines reusable constructs (AuthApi, AppApi) to encapsulate and modularize API Gateway + Lambda logic
- The StateChangeLogger function automatically processes DynamoDB stream events to log data modifications, implementing an event-driven pattern that triggers when modifications are made to the table
- The architecture is divided into multiple stacks (DatabaseStack, LoggingStack, CognitoStack), showing inter-stack references using CloudFormation outputs and dependencies
- Each Lambda automatically logs execution data in a seperate logging group, with the gateway that centralizes logging
- Environment variables are dynamically injected into Lambda functions, and minimal IAM permissions are granted (ie. allowing Lambda read/write access to DynamoDB only where it is required)

# references

- https://docs.aws.amazon.com/cdk/v2/guide/home.html  
- https://docs.aws.amazon.com/cdk/v2/guide/constructs.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Stack.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.App.html  
- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools.html  
- https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito.UserPool.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito.UserPoolClient.html  
- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-using-tokens.html  
- https://docs.aws.amazon.com/lambda/latest/dg/welcome.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html  
- https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_event_sources.DynamoEventSource.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.Architecture.html  
- https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.RestApi.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.LambdaIntegration.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.RequestAuthorizer.html  
- https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html  
- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_dynamodb.Table.html  
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html  
- https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_logs.LogGroup.html  
- https://docs.aws.amazon.com/cdk/v2/guide/resources.html  
