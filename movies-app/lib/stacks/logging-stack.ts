import {
    Stack, StackProps,
    aws_logs as logs,
    aws_lambda as lambda,
    aws_dynamodb as dynamodb,
    aws_lambda_event_sources as eventSources
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

// pass dynamodb table so the stack can attach a stream listener
interface LoggingStackProps extends StackProps {
    table?: dynamodb.Table;
}

// cloudwatch logging group for useractivity logs
// lambda function that logs database state changes
export class LoggingStack extends Stack {
    public readonly logGroup: logs.LogGroup;
    public readonly stateLoggerFn?: lambda.Function;

    constructor(scope: Construct, id: string, props?: LoggingStackProps) {
        super(scope, id, props);

        // capturing log entries using cloudwatch log group for user req logging
        this.logGroup = new logs.LogGroup(this, 'MoviesApiLogs', {
            logGroupName: '/aws/movies-api/requests',
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // lambda function that is triggered by dynamodb stream events
        // writes logs to cloudwatch whenever record is insert.ed or deleted
        if (props?.table) {
            this.stateLoggerFn = new lambda.Function(this, 'StateLoggerFn', {
                runtime: lambda.Runtime.NODEJS_18_X,
                code: lambda.Code.fromAsset('lambda/stateLogger'),
                handler: 'index.handler',
            });
        }
    }
}