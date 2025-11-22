import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';

export class GhostInTheCodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for website hosting
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `ghost-in-the-code-${this.account}-${this.region}`.replace(/\s+/g, ''),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // S3 bucket for audio cache with CORS configuration
    const audioCacheBucket = new s3.Bucket(this, 'AudioCacheBucket', {
      bucketName: `ghost-audio-cache-${this.account}-${this.region}`.replace(/\s+/g, ''),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
    });

    // CloudFront distribution for the website
    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3StaticWebsiteOrigin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });



    // Lambda function for Polly voice synthesis
    const pollyFunction = new NodejsFunction(this, 'PollyFunction', {
      entry: 'lambda/polly/index.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        AUDIO_BUCKET: audioCacheBucket.bucketName,
        VOICE_ID: 'Joanna',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2020',
      },
    });

    // Grant Polly and S3 permissions to Lambda
    pollyFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['polly:SynthesizeSpeech'],
        resources: ['*'],
      })
    );
    audioCacheBucket.grantWrite(pollyFunction);
    audioCacheBucket.grantPublicAccess();

    // API Gateway with CORS
    const api = new apigateway.RestApi(this, 'GameApi', {
      restApiName: 'Ghost in the Code API',
      description: 'API for voice synthesis',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API endpoints
    const voice = api.root.addResource('voice');
    voice.addMethod('POST', new apigateway.LambdaIntegration(pollyFunction));

    // Deploy Vite app to S3 (expects pre-built dist folder)
    // Run 'npm run build' in project root before deploying
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../dist'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 bucket name for website hosting',
      exportName: 'GhostInTheCode-WebsiteBucketName',
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
      exportName: 'GhostInTheCode-DistributionDomain',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID for cache invalidation',
      exportName: 'GhostInTheCode-DistributionId',
    });

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Website URL',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: 'GhostInTheCode-ApiEndpoint',
    });

    new cdk.CfnOutput(this, 'AudioBucketName', {
      value: audioCacheBucket.bucketName,
      description: 'S3 bucket name for audio cache',
      exportName: 'GhostInTheCode-AudioBucketName',
    });
  }
}
