#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DatabaseStack } from "../lib/stacks/database-stack";
import { LoggingStack } from "../lib/stacks/logging-stack";
import { CognitoStack } from "../lib/stacks/cognito-stack";

const app = new cdk.App();

const logStack = new LoggingStack(app, "LoggingStack");
const dbStack = new DatabaseStack(app, "DatabaseStack");

const cognitoStack = new CognitoStack(app, "CognitoStack", {
  table: dbStack.table,
} as any);

cognitoStack.addDependency(logStack);
cognitoStack.addDependency(dbStack);
