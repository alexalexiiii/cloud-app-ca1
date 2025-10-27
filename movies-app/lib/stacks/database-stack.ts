import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DatabaseStack extends Stack {
    public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.table = new dynamodb.Table(this, 'SingleTable', {
            partitionKey: {name: 'PK', type:dynamodb.AttributeType.STRING },
                sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
                billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
                stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        });
    }
}