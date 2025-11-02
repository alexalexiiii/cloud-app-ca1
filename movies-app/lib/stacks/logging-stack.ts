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

