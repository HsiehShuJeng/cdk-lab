import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as redshift_alpha from '@aws-cdk/aws-redshift-alpha';
import { Construct } from 'constructs';
import { RedshiftIamRole } from './iam-roles';

export class RedshitLabStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'defaultVpc', { isDefault: true });
    const rfRole = new RedshiftIamRole(this, 'RedshiftIam');
    const cluster = new redshift_alpha.Cluster(this, 'Redshift', {
      clusterName: 'scott-experiment',
      clusterType: redshift_alpha.ClusterType.SINGLE_NODE,
      masterUser: {
        masterUsername: 'admin'
      },
      vpc,
      vpcSubnets: {
        subnets: vpc.publicSubnets
      },
      publiclyAccessible: true,
      roles: [rfRole.entity]
    });
    new redshift_alpha.Table(this, 'TestTable', {
      cluster: cluster,
      tableName: 'users',
      tableColumns: [
        {
          name: 'userid',
          dataType: 'integer'
        },
        {
          name: 'username',
          dataType: 'char(8)'
        },
        {
          name: 'firstname',
          dataType: 'varchar(30)'
        },
        {
          name: 'lastname',
          dataType: 'varchar(30)'
        },
        {
          name: 'city',
          dataType: 'varchar(30)'
        },
        {
          name: 'state',
          dataType: 'char(2)',
        },
        {
          name: 'email',
          dataType: 'varchar(100)'
        },
        {
          name: 'phone',
          dataType: 'char(14)'
        },
        {
          name: 'likesports',
          dataType: 'boolean'
        },
        {
          name: 'likeheatre',
          dataType: 'boolean'
        },
        {
          name: 'likeconcerts',
          dataType: 'boolean'
        },
        {
          name: 'likejazz',
          dataType: 'boolean'
        },
        {
          name: 'likeclassical',
          dataType: 'boolean'
        }
      ],
      databaseName: 'dev'
    });
    cluster.connections.allowDefaultPortFromAnyIpv4('Open to the world');
    new cdk.CfnOutput(this, 'Cluster', {
      value: cdk.stringToCloudFormation(cluster.secret?.secretName!),
      description: 'The name of the secret attached to the cluster.'
    });
    new cdk.CfnOutput(this, 'SocketAddress', {
      value: cluster.clusterEndpoint.socketAddress,
      description: '\n"HOSTNAME\":\"PORT\" for the cluster'
    });
    new cdk.CfnOutput(this, 'IamRoleArn', { value: rfRole.entity.roleArn, description: 'The ARN of the IAM role for the Redshift cluster.' })
  }
}

// create table users(
// 	userid integer not null distkey sortkey,
// 	username char(8),
// 	firstname varchar(30),
// 	lastname varchar(30),
// 	city varchar(30),
// 	state char(2),
// 	email varchar(100),
// 	phone char(14),
// 	likesports boolean,
// 	liketheatre boolean,
// 	likeconcerts boolean,
// 	likejazz boolean,
// 	likeclassical boolean,
// 	likeopera boolean,
// 	likerock boolean,
// 	likevegas boolean,
// 	likebroadway boolean,
// 	likemusicals boolean);
