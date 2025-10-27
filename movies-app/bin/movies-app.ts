#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { LoggingStack } from '../lib/stacks/logging-stack';

const app = new cdk.App();

const dbStack = new DatabaseStack(app, 'DatabaseStack');
const authStack = new AuthStack(app, 'AuthStack');
const logStack = new LoggingStack(app, 'LoggingStack');

new ApiStack(app, 'ApiStack', {
  table: dbStack.table,
  userPool: authStack.userPool,
  logGroup: logStack.logGroup,
});
