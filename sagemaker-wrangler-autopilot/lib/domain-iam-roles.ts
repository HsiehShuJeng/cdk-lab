import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { SageMakerBucket } from './sagemaker-bucket';

export interface SageMakerExecutionRoleProps {
    /**
     * The construct of the S3 bucket for SageMaker.
     */
    readonly bucket: SageMakerBucket;
}

/**
 * Creates an execution role for the SageMaker Domain. For deeper understanding on the execution role, refer to [SageMaker Roles](https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-roles.html).
 * 
 * ```ts
 * const sageMakerBucket = new SageMakerBucket(this, 'SageMaker');
 * const sageMakerExecutionRole = new SageMakerExecutionRole(this, 'SageMakerExecutor', {
 *      bucket: sageMakerBucket
 * })
 * ```
 */
export class SageMakerExecutionRole extends Construct {
    public readonly iamEntity: iam.Role;
    constructor(scope: Construct, id: string, props: SageMakerExecutionRoleProps) {
        super(scope, id)
        this.iamEntity = new iam.Role(this, 'Role', {
            roleName: 'SageMaker-Domain-Execution-Role',
            assumedBy: new iam.ServicePrincipal(''),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess')
            ],
            inlinePolicies: {
                ['sagemaker-bucket-policy']: new iam.PolicyDocument({
                    assignSids: true,
                    statements: [
                        new iam.PolicyStatement({
                            sid: 'SageMakerBucketPermissions',
                            effect: iam.Effect.ALLOW,
                            actions: ['s3:*'],
                            resources: [
                                `${props.bucket.bucketEntity.bucketArn}`,
                                `${props.bucket.bucketEntity.bucketArn}/*`
                            ]
                        })
                    ]
                })
            }
        })
    }
}