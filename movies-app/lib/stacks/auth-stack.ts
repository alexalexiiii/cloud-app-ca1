import { Stack, StackProps, aws_cognito as cognito } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient; 

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

      this.userPool = new cognito.UserPool(this, 'MoviesUserPool', {
    selfSignUpEnabled: true,
    signInAliases: {email: true, username: true},
  });

this.userPoolClient = this.userPool.addClient('MoviesAppClient', { 
      authFlows: { userPassword: true },
    });
  }
}
