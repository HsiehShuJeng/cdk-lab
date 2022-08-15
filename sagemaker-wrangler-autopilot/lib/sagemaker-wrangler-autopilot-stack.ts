import { Construct } from 'constructs';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker';
import { SageMakerBucket } from './sagemaker-bucket';
import { SageMakerExecutionRole } from './domain-iam-roles';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export interface SagemakerWranglerAutopilotProps extends cdk.StackProps {
  /**
   * The name of the SageMaker Domain.
   * 
   * Refer to [Onboard to Amazon SageMaker Domain](https://docs.aws.amazon.com/sagemaker/latest/dg/gs-studio-onboard.html) for detail.
   * 
   * @default - 'SageMaker-Domain'
   */
  readonly domainName?: string;
  /**
   * The VPC ID that you want your SageMaker Domain to be put in.
   * 
   * @default - the default VPC in your account.
   */
  readonly vpcId?: string;
  /**
   * The subnet IDs where your SageMaker Domain can reach. Either all public, all private, or hybrid, just pick up the chosen ones and assign them as an array of strings (subnet IDs) to this argument.
   * 
   * @default - the public subnets of the default VPC.
   */
  readonly subnetIds?: string[];
}

export class SagemakerWranglerAutopilotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: SagemakerWranglerAutopilotProps) {
    super(scope, id, props);
    const domainName = props?.domainName ?? 'SageMaker-Domain';
    if (props?.domainName === undefined) {
      console.log(`'domainName' left empty, 'My-First-SageMaker-Domain' will be set as default value.`)
    }
    const baseVpc = (props?.vpcId !== undefined) ? ec2.Vpc.fromLookup(this, 'DefaultVpc', { vpcId: props?.vpcId }) : ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });
    if (props?.vpcId === undefined) {
      console.log(`'vpcId' left empty, the default VPC will be set as default value.`)
    }
    const baseSubnetIds: Array<string> = [];
    baseVpc.publicSubnets.forEach(publicSubnet => {
      baseSubnetIds.push(publicSubnet.subnetId)
    });
    if (props?.subnetIds === undefined) {
      console.log(`'subnetIds' left empty, the public subnets of the default VPC will be set as default value.`)
    }

    const sageMakerBucket = new SageMakerBucket(this, 'SageMaker');
    const sageMakerExecutionRole = new SageMakerExecutionRole(this, 'SageMakerExecutor', {
      bucket: sageMakerBucket,
    });
    const subnetIds: Array<string> = (props?.subnetIds !== undefined) ? props?.subnetIds : baseSubnetIds;

    const sagemakerDomin = new sagemaker.CfnDomain(this, 'Domain', {
      authMode: 'IAM',
      defaultUserSettings: {
        executionRole: sageMakerExecutionRole.iamEntity.roleArn,
        jupyterServerAppSettings: {
          defaultResourceSpec: {
            instanceType: 'ml.c5.xlarge'
            // [Available Amazon SageMaker Images](https://docs.aws.amazon.com/sagemaker/latest/dg/notebooks-available-images.html)
            // [Specifying the Prebuilt Images Manually](https://docs.aws.amazon.com/sagemaker/latest/dg/pre-built-docker-containers-scikit-learn-spark.html#pre-built-containers-scikit-learn-manual)
          },
        },
        kernelGatewayAppSettings: {
          defaultResourceSpec: {
            instanceType: 'ml.c5.xlarge'
          }
        },
        rStudioServerProAppSettings: {
          accessStatus: 'ENABLED',
          userGroup: 'R_STUDIO_USER'
        }
      },
      domainName: domainName,
      vpcId: baseVpc.vpcId,
      subnetIds: subnetIds,
      appNetworkAccessType: NetworkAccessType.VPC_ONLY,
      appSecurityGroupManagement: '',
      domainSettings: {
        rStudioServerProDomainSettings: {
          defaultResourceSpec: {
            instanceType: 'ml.c5.xlarge'
          },
          domainExecutionRoleArn: sageMakerExecutionRole.iamEntity.roleArn
        },
        securityGroupIds: subnetIds
      },
      tags: [{
        key: 'Author',
        value: 'scott.hsieh'
      }]
    })

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'SagemakerWranglerAutopilotQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}

/**
 * What kind of network access you wish for your SageMaker Domain.
 */
export enum NetworkAccessType {
  /**
   * Non-EFS traffic is through a VPC managed by Amazon SageMaker , which allows direct internet access.
   */
  PUBLIC_INTERNET_ONLY = 'PublicInternetOnly',
  /**
   * All Studio traffic is through the specified VPC and subnets.
   */
  VPC_ONLY = 'VPC_ONLY'
}