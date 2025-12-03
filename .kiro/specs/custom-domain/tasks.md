# Implementation Plan

- [x] 1. Update CDK stack to support optional domain configuration





  - Modify `GhostInTheCodeStack` constructor to accept optional domain parameters (domainName, hostedZoneId, hostedZoneName)
  - Add TypeScript interface for domain configuration props
  - Ensure backward compatibility when domain parameters are not provided
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 1.1 Write property test for backward compatibility
  - **Property 4: Backward compatibility**
  - **Validates: Requirements 3.3**

- [x] 2. Implement ACM certificate creation with DNS validation





  - Create ACM certificate resource in us-east-1 region
  - Configure certificate with DNS validation method
  - Reference the provided hosted zone for automatic validation record creation
  - Use conditional logic to only create certificate when domain parameters are provided
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 2.1 Write property test for certificate configuration
  - **Property 2: Certificate configuration correctness**
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 3. Update CloudFront distribution with custom domain support





  - Add domainNames property to CloudFront distribution when domain is configured
  - Attach ACM certificate to distribution
  - Maintain existing viewerProtocolPolicy for HTTPS redirect
  - Keep all existing cache behaviors and origin configuration
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 3.1 Write property test for CloudFront HTTPS configuration
  - **Property 2: HTTPS enforcement**
  - **Validates: Requirements 1.2**

- [ ]* 3.2 Write property test for certificate attachment
  - **Property 3: Certificate validity**
  - **Validates: Requirements 1.3**

- [x] 4. Create Route 53 DNS records for custom domain





  - Look up existing hosted zone using provided hostedZoneId
  - Create A record (IPv4) alias pointing to CloudFront distribution
  - Create AAAA record (IPv6) alias pointing to CloudFront distribution
  - Use conditional logic to only create records when domain is configured
  - _Requirements: 1.4_

- [ ]* 4.1 Write property test for DNS record creation
  - **Property 1: Domain resolution consistency**
  - **Validates: Requirements 1.4**

- [x] 5. Add CDK outputs for domain configuration




  - Add output for custom domain URL when domain is configured
  - Add output for certificate ARN when certificate is created
  - Add output for Route 53 record name when DNS records are created
  - Ensure existing CloudFront distribution URL output remains
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 5.1 Write property test for output completeness
  - **Property 5: Configuration propagation**
  - **Validates: Requirements 3.4, 4.4**

- [x] 6. Update CDK app entry point to read domain configuration





  - Modify bin file to read domain configuration from environment variables
  - Pass domain configuration to stack constructor when variables are present
  - Handle missing or incomplete domain configuration gracefully
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 7. Create environment configuration documentation





  - Add .env.example file in infrastructure directory with domain variables
  - Document required environment variables (DOMAIN_NAME, HOSTED_ZONE_ID, HOSTED_ZONE_NAME)
  - Add instructions for obtaining hosted zone ID from Route 53
  - _Requirements: 3.1, 3.2_
-

- [x] 8. Update deployment scripts with domain support



  - Update deploy.sh to check for domain environment variables
  - Update deploy.ps1 to check for domain environment variables
  - Add informational messages about domain configuration status
  - _Requirements: 3.3, 3.4_

- [x] 9. Update GitHub Actions workflow with domain configuration support



  - Add domain environment variables to CDK deployment step (DOMAIN_NAME, HOSTED_ZONE_ID, HOSTED_ZONE_NAME)
  - Configure variables to read from GitHub repository secrets
  - Add comments documenting the optional domain configuration secrets
  - Ensure workflow works with or without domain secrets configured
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 10. Update README with custom domain setup instructions
  - Add section explaining custom domain configuration
  - Document prerequisites (Route 53 hosted zone, domain ownership)
  - Provide step-by-step setup instructions
  - Include troubleshooting tips for common issues
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
