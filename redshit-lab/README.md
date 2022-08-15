# redshift-lab  
## Connect to the Redshift cluster  
1. Login with DBeavor  
   ![log-in with DBeavor](images/dbeavor-login-1.png)  
2. Fill in necessary connection information  
   ![connection test with DBeavor](images/dbeavor-connection-test.png)  

## Import the NYC taxi data into the cluster  
1. Copy Redshift sample data  
    ```sh
    $ curl https://docs.aws.amazon.com/redshift/latest/gsg/samples/tickitdb.zip --output tickitdb.zip
    $ mkdir tickitdb
    $ unzip tickitdb.zip -d tickitdb
    ```
2. Copy copy from local to specific S3 bucket  
    ```sh
    PROFILE_NAME="scott.hsieh"
    BUCKET_NAME="emr-serverless-630778274080"
    aws s3 cp --recursive tickitdb/ s3://${BUCKET_NAME}/tickitdb/ --profile ${PROFILE_NAME}
    ```
3. Create a table, ust copy and paste from [here](https://docs.aws.amazon.com/redshift/latest/gsg/rs-gsg-create-sample-db.html).  
4. Execute `COPY` command, copy and paste again from [here](https://docs.aws.amazon.com/redshift/latest/gsg/rs-gsg-create-sample-db.html)   
    ```sh
    ## uesrs
    copy users from 's3://emr-serverless-630778274080/tickitdb/allusers_pipe.txt'
    iam_role 'arn:aws:iam::630778274080:role/Redshift-Lab-Role'
    delimiter '|' region 'ap-northeast-1';
    ## venue
    copy venue from 's3://emr-serverless-630778274080/tickitdb/venue_pipe.txt' 
    iam_role 'arn:aws:iam::630778274080:role/Redshift-Lab-Role'
    delimiter '|' region 'ap-northeast-1';
    ## category
    copy category from 's3://emr-serverless-630778274080/tickitdb/category_pipe.txt' 
    iam_role 'arn:aws:iam::630778274080:role/Redshift-Lab-Role'
    delimiter '|' region 'ap-northeast-1';
    ## date
    copy date from 's3://emr-serverless-630778274080/tickitdb/date2008_pipe.txt' 
    iam_role 'arn:aws:iam::630778274080:role/Redshift-Lab-Role'
    delimiter '|' region 'ap-northeast-1';
    ## event
    copy event from 's3://emr-serverless-630778274080/tickitdb/allevents_pipe.txt' 
    iam_role 'arn:aws:iam::630778274080:role/Redshift-Lab-Role'
    delimiter '|' timeformat 'YYYY-MM-DD HH:MI:SS' region 'ap-northeast-1';
    ## listing
    copy listing from 's3://emr-serverless-630778274080/tickitdb/listings_pipe.txt' 
    iam_role 'arn:aws:iam::630778274080:role/Redshift-Lab-Role'
    delimiter '|' region 'ap-northeast-1';
    ## sales
    copy sales from 's3://emr-serverless-630778274080/tickitdb/sales_tab.txt'
    iam_role 'arn:aws:iam::630778274080:role/Redshift-Lab-Role'
    delimiter '\t' timeformat 'MM/DD/YYYY HH:MI:SS' region 'ap-northeast-1';
    ```


Reproducing steps
1. step 1
   ```typescript
   import * as cdk from 'aws-cdk-lib';
   import * as ec2 from 'aws-cdk-lib/aws-ec2';
   import * as redshift_alpha from '@aws-cdk/aws-redshift-alpha';import { Construct } from 'constructs';
   .
   .
   .
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
   ```
2. step 2  
    ```typescript
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
        }
      ],
      databaseName: 'dev'
    });
    ```
3. step 3
   ```typescript
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
   ```