#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FargateWindowTaskStack } from '../lib/fargate-window-task-stack';

const app = new cdk.App();
new FargateWindowTaskStack(app, 'FargateWindowTaskStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});