#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FargateLinuxTaskStack } from '../lib/fargate-linux-task-stack';

const app = new cdk.App();
new FargateLinuxTaskStack(app, 'FargateLinuxTaskStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});