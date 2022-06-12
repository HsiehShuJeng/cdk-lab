import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * Creates an IAM role for the Redshift cluster to interact with specific servies.
 * 
 * For detail of IAM roles for Redshift, please refer to [Create an IAM role for Amazon Redshift](https://docs.aws.amazon.com/redshift/latest/dg/c-getting-started-using-spectrum-create-role.html).  
 * For detail of service principals, refer to For detail of service principals, refer to [AWS service principals](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_principal.html#principal-services).
 */
export class RedshiftIamRole extends Construct {
    /**
     * The representative of the IAM role.
     */
    public readonly entity: iam.Role;
    constructor(scope: Construct, id: string) {
        super(scope, id)
        this.entity = new iam.Role(this, 'Role', {
            roleName: 'Redshift-Lab-Role',
            assumedBy: new iam.ServicePrincipal('redshift.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AWSGlueConsoleFullAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonAthenaFullAccess')
            ],
            inlinePolicies: {
                ['LakeFormationPolicy']: new iam.PolicyDocument({
                    assignSids: true,
                    statements: [new iam.PolicyStatement({
                        sid: 'RedshiftPolicyForLF',
                        effect: iam.Effect.ALLOW,
                        actions: [
                            'glue:*',
                            'lakeformation:GetDataAccess'
                        ],
                        resources: ['*']
                    })]
                })
            }
        })
    }
}