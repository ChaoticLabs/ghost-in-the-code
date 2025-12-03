# Custom Domain Design Document

## Overview

This design adds custom domain support to the Ghost in The Code CDK infrastructure by integrating AWS Route 53, ACM (AWS Certificate Manager), and CloudFront. The solution enables the application to be accessed via `ghost.chaotictoejam.com` with automatic SSL certificate provisioning and DNS management.

The implementation follows AWS best practices for CloudFront custom domains, including certificate creation in us-east-1 (required for CloudFront), DNS validation for automatic certificate management, and A record aliasing to the CloudFront distribution.

## Architecture

### High-Level Architecture

```
User Request (ghost.chaotictoejam.com)
    ↓
Route 53 DNS (A Record Alias)
    ↓
CloudFront Distribution (with ACM Certificate)
    ↓
S3 Origin (Website Content)
```

### Component Interaction Flow

1. User navigates to `ghost.chaotictoejam.com`
2. DNS query resolves via Route 53 A record to CloudFront distribution
3. CloudFront terminates SSL using ACM certificate
4. CloudFront serves content from S3 origin
5. Response returns to user with proper HTTPS encryption

### AWS Services Integration

- **Route 53**: Manages DNS records for the custom domain
- **ACM**: Provides SSL/TLS certificate with automatic renewal
- **CloudFront**: CDN that uses the certificate and responds to custom domain requests
- **CDK**: Orchestrates all resource creation and configuration

## Components and Interfaces

### 1. CDK Stack Enhancement

**Modifications to `GhostInTheCodeStack`:**

- Add optional constructor parameters for domain configuration
- Conditionally create domain-related resources when parameters are provided
- Maintain backward compatibility for deployments without custom domain

**Constructor Interface:**
```typescript
interface GhostInTheCodeStackProps extends cdk.StackProps {
  domainName?: string;        // e.g., "ghost.chaotictoejam.com"
  hostedZoneId?: string;      // Route 53 hosted zone ID
  hostedZoneName?: string;    // e.g., "chaotictoejam.com"
}
```

### 2. Certificate Resource

**ACM Certificate Configuration:**
- Must be created in `us-east-1` region (CloudFront requirement)
- Uses DNS validation method
- Validation records automatically created in Route 53
- Subject Alternative Names (SANs) can include additional domains if needed

**Implementation Approach:**
- Use `aws-cdk-lib/aws-certificatemanager` module
- Create cross-region certificate using `DnsValidatedCertificate` or `Certificate` with DNS validation
- Reference existing hosted zone by ID

### 3. CloudFront Distribution Update

**Configuration Changes:**
- Add `domainNames` property with custom domain
- Add `certificate` property referencing ACM certificate
- Maintain existing cache behaviors and origin configuration
- Keep existing error response handling

### 4. Route 53 DNS Record

**A Record Configuration:**
- Create A record (IPv4) alias to CloudFront distribution
- Create AAAA record (IPv6) alias to CloudFront distribution
- Use `RecordTarget.fromAlias()` with CloudFront target
- Records created in existing hosted zone

### 5. CDK App Instantiation

**Modifications to `bin/` entry point:**
- Read domain configuration from environment variables or context
- Pass configuration to stack constructor
- Provide clear documentation for required variables

## Data Models

### Stack Configuration

```typescript
interface DomainConfig {
  domainName: string;           // Full domain name
  hostedZoneId: string;         // Route 53 hosted zone ID
  hostedZoneName: string;       // Base domain for hosted zone lookup
}

interface StackConfig {
  domain?: DomainConfig;        // Optional domain configuration
  env: {
    account: string;
    region: string;
  };
}
```

### Environment Variables

```
DOMAIN_NAME=ghost.chaotictoejam.com
HOSTED_ZONE_ID=Z1234567890ABC
HOSTED_ZONE_NAME=chaotictoejam.com
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Domain resolution consistency
*For any* deployed stack with domain configuration, querying DNS for the custom domain should return the CloudFront distribution's IP addresses
**Validates: Requirements 1.4**

### Property 2: HTTPS enforcement
*For any* HTTP request to the custom domain, the response should be a redirect to the HTTPS version of the same URL
**Validates: Requirements 1.2**

### Property 3: Certificate validity
*For any* HTTPS request to the custom domain, the presented certificate should be valid, not expired, and match the domain name
**Validates: Requirements 1.3**

### Property 4: Backward compatibility
*For any* stack deployment without domain parameters, the stack should deploy successfully with only the CloudFront distribution URL
**Validates: Requirements 3.3**

### Property 5: Configuration propagation
*For any* stack deployment with domain parameters, all domain-related resources (certificate, DNS records, CloudFront configuration) should be created and properly linked
**Validates: Requirements 3.4**

## Error Handling

### Certificate Validation Failures

**Scenario**: DNS validation cannot complete due to incorrect hosted zone or permissions

**Handling**:
- CDK deployment will wait for validation with timeout
- Clear error message indicating validation failure
- Stack rollback to prevent partial deployment
- Documentation includes troubleshooting steps

### Domain Already in Use

**Scenario**: Domain is already associated with another CloudFront distribution

**Handling**:
- CloudFront will reject the configuration
- CDK deployment fails with descriptive error
- User must remove domain from other distribution first

### Missing Hosted Zone

**Scenario**: Provided hosted zone ID doesn't exist or is inaccessible

**Handling**:
- CDK synthesis or deployment fails early
- Error message indicates hosted zone not found
- User must verify hosted zone ID and AWS credentials

### Region Mismatch

**Scenario**: Certificate not created in us-east-1

**Handling**:
- Use cross-region certificate creation
- CDK automatically handles region requirements
- Certificate resource explicitly specifies us-east-1

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Stack synthesizes correctly with domain parameters
- Stack synthesizes correctly without domain parameters
- Certificate is created in us-east-1 region
- CloudFront distribution includes custom domain when configured
- Route 53 records are created with correct target

**Testing Approach**:
- Use CDK's `assertions` module for template testing
- Mock AWS service calls
- Verify CloudFormation template structure
- Test both with and without domain configuration

### Property-Based Testing

Property-based tests will verify:
- **Property 4 (Backward compatibility)**: Generate random stack configurations without domain parameters and verify successful synthesis
- **Property 5 (Configuration propagation)**: Generate random valid domain configurations and verify all resources are created

**Testing Framework**: fast-check (JavaScript/TypeScript property-based testing library)

**Test Configuration**: Minimum 100 iterations per property test

### Integration Testing

Integration tests will verify:
- Actual DNS resolution to CloudFront distribution
- HTTPS certificate validation
- HTTP to HTTPS redirect functionality
- End-to-end request flow through custom domain

**Note**: Integration tests require actual AWS deployment and are optional for this hackathon project

### Manual Verification Steps

After deployment:
1. Verify certificate status in ACM console (us-east-1)
2. Check DNS records in Route 53 console
3. Test HTTP redirect: `curl -I http://ghost.chaotictoejam.com`
4. Test HTTPS access: `curl -I https://ghost.chaotictoejam.com`
5. Verify certificate in browser
6. Test application functionality through custom domain

## Deployment Process

### Prerequisites

1. AWS account with appropriate permissions
2. Existing Route 53 hosted zone for `chaotictoejam.com`
3. Hosted zone ID available
4. Domain registrar NS records pointing to Route 53

### Deployment Steps

1. Set environment variables for domain configuration
2. Run `npm run build` to create production build
3. Run CDK deployment: `npm run deploy` (in infrastructure directory)
4. Wait for certificate validation (typically 5-10 minutes)
5. Verify deployment outputs
6. Test custom domain access

### Configuration Files

**infrastructure/.env**:
```
DOMAIN_NAME=ghost.chaotictoejam.com
HOSTED_ZONE_ID=Z1234567890ABC
HOSTED_ZONE_NAME=chaotictoejam.com
```

### Rollback Strategy

If deployment fails or issues arise:
1. CDK automatically rolls back failed deployments
2. Remove domain configuration from environment
3. Redeploy without custom domain
4. Application remains accessible via CloudFront URL

## Security Considerations

### SSL/TLS Configuration

- Use TLS 1.2 as minimum protocol version
- CloudFront default security policy provides strong cipher suites
- Certificate automatically renews before expiration

### DNS Security

- DNSSEC can be enabled on Route 53 hosted zone (optional)
- Route 53 provides DDoS protection via AWS Shield Standard

### Access Control

- S3 bucket remains private with OAC (Origin Access Control)
- CloudFront is the only public entry point
- API Gateway endpoints remain separate and can have independent domains

## Performance Considerations

### DNS Resolution

- Route 53 provides low-latency DNS resolution globally
- A record alias has no additional lookup cost
- DNS responses are cached by resolvers

### Certificate Validation

- Certificate validation happens once during deployment
- No runtime performance impact
- Automatic renewal prevents expiration issues

### CloudFront Behavior

- Custom domain has no performance impact vs default domain
- Same edge locations and caching behavior
- Same cache policies and TTLs apply

## Future Enhancements

### Multiple Domains

- Support for www subdomain
- Support for multiple environment domains (staging, production)
- Wildcard certificates for subdomain flexibility

### Advanced DNS

- Health checks for failover scenarios
- Geolocation routing for regional content
- Weighted routing for A/B testing

### Monitoring

- CloudWatch alarms for certificate expiration
- Route 53 health checks
- CloudFront access logs analysis

## Documentation Updates

### README Updates

Add section covering:
- Custom domain setup instructions
- Environment variable configuration
- DNS prerequisites
- Troubleshooting common issues

### Deployment Script Updates

Update deployment scripts to:
- Check for domain environment variables
- Provide clear feedback about domain configuration
- Include validation steps in deployment process
