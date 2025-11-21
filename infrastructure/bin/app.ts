#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GhostInTheCodeStack } from '../lib/ghost-in-the-code-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

new GhostInTheCodeStack(app, 'GhostInTheCodeStack', {
  env,
  description: 'Ghost in The Code - Interactive coding game infrastructure',
});

app.synth();
