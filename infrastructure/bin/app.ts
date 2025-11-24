#!/usr/bin/env node
import 'source-map-support/register';
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { GhostInTheCodeStack } from '../lib/ghost-in-the-code-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Read domain configuration from environment variables
const domainName = process.env.DOMAIN_NAME;
const hostedZoneName = process.env.HOSTED_ZONE_NAME;

// Only include domain configuration if all required variables are present
const hasDomainConfig = domainName && hostedZoneName;

new GhostInTheCodeStack(app, 'GhostInTheCodeStack', {
  env,
  description: 'Ghost in The Code - Interactive coding game infrastructure',
  ...(hasDomainConfig && {
    domainName,
    hostedZoneName,
  }),
});

app.synth();
