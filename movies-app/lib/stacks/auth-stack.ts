import { Stack, StackProps, aws_cognito as cognito } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class AuthStack extends Stack {
  public readonly userPool: cognito.UserPool;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

      this.userPool = new cognito.UserPool(this, 'MoviesUserPool', {
    selfSignUpEnabled: true,
    signInAliases: {email: true, username: true},
  });

  this.userPool.addClient('MoviesAppClient', {
    authFlows: {userPassword: true },
  });
}
}
