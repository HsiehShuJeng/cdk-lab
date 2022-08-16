import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';

export class FargateWindowTaskStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const defaultVpc = ec2.Vpc.fromLookup(this, 'defaultVpc', { isDefault: true });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: 'fargate-windows-cluster',
      vpc: defaultVpc
    });

    const windowsTaskDefinition = new ecs.FargateTaskDefinition(this, 'WindowsTaskDefinition', {
      family: 'windows-simple-iis-2019-core',
      runtimePlatform: {
        operatingSystemFamily: ecs.OperatingSystemFamily.WINDOWS_SERVER_2019_CORE
      },
      memoryLimitMiB: 4096,
      cpu: 2048
    });
    windowsTaskDefinition.addContainer("Container", {
      command: [
        `New-Item -Path C:\\inetpub\\wwwroot\\index.html -Type file -Value '<html> <head> <title>Amazon ECS Sample App</title> <style>body {margin-top: 40px; background-color: #333;} </style> </head><body> <div style=color:white;text-align:center> <h1>Amazon ECS Sample App</h1> <h2>Congratulations!</h2> <p>Your application is now running on a container in Amazon ECS.</p>'; C:\\ServiceMonitor.exe w3svc`
      ],
      entryPoint: [
        'powershell', '-Command'
      ],
      essential: true,
      image: ecs.ContainerImage.fromRegistry('mcr.microsoft.com/windows/servercore/iis:windowsservercore-ltsc2019'),
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'ecs',
        logGroup: new logs.LogGroup(this, 'fargateWindowsLogGroup', {
          logGroupName: '/ecs/fargate-windows-task-definition'
        })
      }),
      containerName: 'sample_windows_app',
      portMappings: [
        {
          hostPort: 80,
          containerPort: 80,
          protocol: ecs.Protocol.TCP
        }
      ]
    });

    const fargateWindowsService = new ecs.FargateService(this, 'FargateService', {
      cluster: cluster,
      taskDefinition: windowsTaskDefinition,
      serviceName: 'fargate-windows-service',
      desiredCount: 1,
      assignPublicIp: true,
      vpcSubnets: {
        subnets: defaultVpc.publicSubnets
      },
      securityGroups: [ec2.SecurityGroup.fromSecurityGroupId(this, 'defaultSg', 'sg-17b0c672')]
    });
    new cdk.CfnOutput(this, 'ServiceArn', { value: fargateWindowsService.serviceArn, description: 'Service ARN' });
    new cdk.CfnOutput(this, 'TaskId', { value: windowsTaskDefinition.taskDefinitionArn, description: 'Task ARN' });
  }
}
