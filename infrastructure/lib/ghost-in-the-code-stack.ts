import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';

export interface GhostInTheCodeStackProps extends cdk.StackProps {
  domainName?: string;
  hostedZoneName?: string;
}

export class GhostInTheCodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: GhostInTheCodeStackProps) {
    super(scope, id, props);

    // S3 bucket for website hosting
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `ghost-in-the-code-${this.account}-${this.region}`.replace(/\s+/g, ''),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // S3 bucket for audio cache with CORS configuration and public read access
    const audioCacheBucket = new s3.Bucket(this, 'AudioCacheBucket', {
      bucketName: `ghost-audio-cache-${this.account}-${this.region}`.replace(/\s+/g, ''),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: false,
        ignorePublicAcls: true,
        restrictPublicBuckets: false,
      }),
      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
    });

    // Add bucket policy for public read access
    audioCacheBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${audioCacheBucket.bucketArn}/*`],
      })
    );

    // ACM Certificate for custom domain (if domain parameters are provided)
    let certificate: acm.ICertificate | undefined;
    if (props?.domainName && props?.hostedZoneName) {
      // Look up the existing hosted zone by domain name
      const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: props.hostedZoneName,
      });

      // Create certificate in us-east-1 (required for CloudFront)
      certificate = new acm.Certificate(this, 'Certificate', {
        domainName: props.domainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });
    }

    // CloudFront distribution for the website
    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
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
      // Add custom domain configuration when domain parameters are provided
      domainNames: props?.domainName ? [props.domainName] : undefined,
      certificate: certificate,
    });

    // Route 53 DNS records for custom domain (if domain parameters are provided)
    if (props?.domainName && props?.hostedZoneName) {
      // Look up the existing hosted zone by domain name
      const hostedZone = route53.HostedZone.fromLookup(this, 'DnsHostedZone', {
        domainName: props.hostedZoneName,
      });

      // Create A record (IPv4) alias pointing to CloudFront distribution
      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        recordName: props.domainName,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      });

      // Create AAAA record (IPv6) alias pointing to CloudFront distribution
      new route53.AaaaRecord(this, 'AliasRecordAAAA', {
        zone: hostedZone,
        recordName: props.domainName,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      });
    }

    // Lambda function for Polly voice synthesis
    const pollyFunction = new NodejsFunction(this, 'PollyFunction', {
      entry: 'lambda/polly/index.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        AUDIO_BUCKET: audioCacheBucket.bucketName,
        VOICE_ID: 'Justin',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2022',
      },
    });

    // Grant Polly and S3 permissions to Lambda
    pollyFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['polly:SynthesizeSpeech'],
        resources: ['*'],
      })
    );
    audioCacheBucket.grantReadWrite(pollyFunction);

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
    voice.addMethod('POST', new apigateway.LambdaIntegration(pollyFunction, {
      proxy: true,
    }));

    // Deploy Vite app to S3 (expects pre-built dist folder)
    // Run 'npm run build' in project root before deploying
    const deployment = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../dist'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512,
      ephemeralStorageSize: cdk.Size.mebibytes(1024),
      retainOnDelete: false,
    });
    
    // Ensure deployment happens after distribution is ready
    deployment.node.addDependency(distribution);

    // Outputs
    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 bucket name for website hosting',
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID for cache invalidation',
    });

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Website URL',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
    });

    new cdk.CfnOutput(this, 'AudioBucketName', {
      value: audioCacheBucket.bucketName,
      description: 'S3 bucket name for audio cache',
    });

    // Conditional outputs for custom domain configuration
    if (props?.domainName) {
      new cdk.CfnOutput(this, 'CustomDomainUrl', {
        value: `https://${props.domainName}`,
        description: 'Custom domain URL',
      });

      new cdk.CfnOutput(this, 'CustomDomainName', {
        value: props.domainName,
        description: 'Custom domain name',
      });
    }

    if (certificate) {
      new cdk.CfnOutput(this, 'CertificateArn', {
        value: certificate.certificateArn,
        description: 'ACM certificate ARN',
      });
    }

    if (props?.domainName) {
      new cdk.CfnOutput(this, 'Route53RecordName', {
        value: props.domainName,
        description: 'Route 53 DNS record name',
      });
    }
  }
}
