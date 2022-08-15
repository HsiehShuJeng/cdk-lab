import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

export class FargateLinuxTaskStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const defaultVpc = ec2.Vpc.fromLookup(this, 'defaultVpc', { isDefault: true });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: 'fargate-cluster',
      vpc: defaultVpc
    });

    const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'LinuxTaskDefinition', {
      family: 'sample-fargate',
      memoryLimitMiB: 512,
      cpu: 256,
    });
    fargateTaskDefinition.addContainer("Container", {
      containerName: 'fargate-app',
      image: ecs.ContainerImage.fromRegistry("public.ecr.aws/docker/library/httpd:latest"),
      portMappings: [{
        containerPort: 80,
        hostPort: 80,
        protocol: ecs.Protocol.TCP
      }],
      essential: true,
      entryPoint: [
        'sh', '-c'
      ],
      command: [
        "/bin/sh -c \"echo '<html> <head> <title>Amazon ECS Sample App</title> <style>body {margin-top: 40px; background-color: #333;} </style> </head><body> <div style=color:white;text-align:center> <h1>Amazon ECS Sample App</h1> <h2>Congratulations!</h2> <p>Your application is now running on a container in Amazon ECS.</p> </div></body></html>' >  /usr/local/apache2/htdocs/index.html && httpd-foreground\""
      ]
    });

    const fargateServive = new ecs.FargateService(this, 'FargateService', {
      cluster: cluster,
      taskDefinition: fargateTaskDefinition,
      serviceName: 'fargate-service',
      desiredCount: 1,
      assignPublicIp: true,
      vpcSubnets: {
        subnets: defaultVpc.publicSubnets
      },
      securityGroups: [ec2.SecurityGroup.fromSecurityGroupId(this, 'defaultSg', 'sg-17b0c672')]
    });
    new cdk.CfnOutput(this, 'ServiceArn', { value: fargateServive.serviceArn, description: 'Service ARN' });
    new cdk.CfnOutput(this, 'TaskId', { value: fargateTaskDefinition.taskDefinitionArn, description: 'Task ARN' });
  }
}
