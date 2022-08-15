import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class FargateLinuxTaskStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ecs.Cluster(this, 'Cluster', {
      clusterName: 'fargate-cluster',
      vpc: ec2.Vpc.fromLookup(this, 'defaultVpc', { isDefault: true })
    });
  }
}
