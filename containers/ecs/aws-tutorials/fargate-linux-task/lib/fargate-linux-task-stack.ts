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
  }
}
