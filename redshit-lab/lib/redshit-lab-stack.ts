import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as redshift_alpha from '@aws-cdk/aws-redshift-alpha';
import { Construct } from 'constructs';

export class RedshitLabStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'defaultVpc', { isDefault: true });
    const cluster = new redshift_alpha.Cluster(this, 'Redshift', {
      clusterName: 'scott-experiment',
      clusterType: redshift_alpha.ClusterType.MULTI_NODE,
      masterUser: {
        masterUsername: 'admin'
      },
      vpc,
      vpcSubnets: {
        subnets: vpc.publicSubnets
      },
      publiclyAccessible: true
    });
    cluster.connections.allowDefaultPortFromAnyIpv4('Open to the world');
    new cdk.CfnOutput(this, 'Cluster', {
      value: cdk.stringToCloudFormation(cluster.secret?.secretName!),
      description: 'The name of the secret attached to the cluster.'
    });
  }
}
