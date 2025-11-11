#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { LoggingStack } from '../lib/stacks/logging-stack';
import { CognitoStack } from '../lib/stacks/cognito-stack';

const app = new cdk.App();

const dbStack = new DatabaseStack(app, 'DatabaseStack');
const authStack = new AuthStack(app, 'AuthStack');
const logStack = new LoggingStack(app, 'LoggingStack');

const cognitoStack = new CognitoStack(app, 'CognitoStack');

// add stack dependencies
dbStack.addDependency(authStack);
dbStack.addDependency(logStack);
authStack.addDependency(logStack);
cognitoStack.addDependency(authStack);
