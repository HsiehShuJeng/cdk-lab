import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface SageMakerBucketProps {
    /**
               * The bucket name for the workspace of an EMR Studio.
               *
               * @default - 'sagemaker-AWS::Region-AWS::AccountId'
               */
    readonly bucketName?: string;
    /**
               * Policy to apply when the bucket is removed from this stack.
               *
               * @default - The bucket will be deleted.
               */
    readonly removalPolicy?: cdk.RemovalPolicy;
}

/**
 * Creates an S3 bucket for the SageMaker Domain. Wanna know what SageMaker Domain is, go check [Onboard to Amazon SageMaker Domain](https://docs.aws.amazon.com/sagemaker/latest/dg/gs-studio-onboard.html)
 * 
 * ```ts
 * const sageMakerBucket = new SageMakerBucket(this, 'SageMaker');
 * ```
 */
export class SageMakerBucket extends Construct {
    public readonly bucketEntity: s3.Bucket;
    constructor(scope: Construct, name: string, props?: SageMakerBucketProps) {
        super(scope, name);
        const removalPolicy = (props !== undefined) ? props.removalPolicy : cdk.RemovalPolicy.DESTROY;
        const bucketName = (props !== undefined) ? props.bucketName : `sagemaker${cdk.Aws.REGION}-${cdk.Aws.ACCOUNT_ID}`;
        this.bucketEntity = new s3.Bucket(this, 'Bucket', {
            bucketName: bucketName,
            removalPolicy: removalPolicy,
            autoDeleteObjects: (removalPolicy !== cdk.RemovalPolicy.RETAIN) ? true : false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });
        new cdk.CfnOutput(this, 'BucketArn', { value: this.bucketEntity.bucketArn, description: 'The ARN of the workspace bucket.' });
    }
}