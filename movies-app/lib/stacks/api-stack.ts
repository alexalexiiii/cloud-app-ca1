import {
  Stack, StackProps,
  aws_lambda as lambda,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigw,
  aws_iam as iam,
  aws_cognito as cognito,
  aws_logs as logs
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

interface ApiStackProps extends StackProps {
  table: dynamodb.Table;
  userPool: cognito.UserPool;
  logGroup: logs.LogGroup;
}