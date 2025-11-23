# GitHub Actions CI/CD Pipeline - Design Document

## Overview

This design establishes a GitHub Actions workflow that automates the build and deployment process for the Ghost in The Code application. The workflow uses OIDC authentication to securely connect to AWS, builds the Vite frontend application, and deploys infrastructure using AWS CDK. The design prioritizes security (no hardcoded credentials), reliability (fail-fast on errors), and efficiency (caching and parallel execution where possible).

## Architecture

### Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Repository                            │
│                                                                  │
│  Push to main / Manual Trigger                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GitHub Actions Runner                           │
│                    (ubuntu-latest)                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Step 1: Checkout Code                                     │ │
│  │  - actions/checkout@v4                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                     │                                            │
│                     ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Step 2: Setup Node.js 20                                  │ │
│  │  - actions/setup-node@v4                                   │ │
│  │  - Enable npm caching                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                     │                                            │
│                     ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Step 3: Configure AWS Credentials                         │ │
│  │  - aws-actions/configure-aws-credentials@v4                │ │
│  │  - OIDC authentication with IAM Role                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                     │                                            │
│                     ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Step 4: Install Frontend Dependencies                     │ │
│  │  - npm ci (uses cache from Step 2)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                     │                                            │
│                     ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Step 5: Build Frontend                                    │ │
│  │  - npm run build (TypeScript + Vite)                       │ │
│  │  - Produces /dist artifacts                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                     │                                            │
│                     ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Step 6: Install CDK Dependencies                          │ │
│  │  - cd infrastructure && npm ci                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                     │                                            │
│                     ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Step 7: Deploy Infrastructure                             │ │
│  │  - npx cdk deploy --require-approval never                 │ │
│  │  - Uploads /dist to S3                                     │ │
│  │  - Updates CloudFormation stack                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Account                                 │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ CloudFormation│───►│  S3 Bucket   │───►│ CloudFront   │     │
│  │    Stack      │    │  (Website)   │    │ Distribution │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ API Gateway  │    │   Lambda     │    │   Bedrock    │     │
│  │              │───►│  Functions   │───►│   & Polly    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### OIDC Authentication Flow

```
┌──────────────────┐                    ┌──────────────────┐
│  GitHub Actions  │                    │   AWS IAM        │
│     Workflow     │                    │                  │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │ 1. Request OIDC token                │
         │────────────────────────────────────►  │
         │                                       │
         │ 2. Return signed JWT token            │
         │ ◄────────────────────────────────────│
         │                                       │
         │ 3. AssumeRoleWithWebIdentity          │
         │    (with JWT token)                   │
         │────────────────────────────────────►  │
         │                                       │
         │ 4. Validate token & return            │
         │    temporary credentials              │
         │ ◄────────────────────────────────────│
         │                                       │
         │ 5. Use credentials for AWS API calls  │
         │────────────────────────────────────►  │
         │                                       │
```

## Components and Interfaces

### Workflow Configuration

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to AWS

# Trigger conditions
on:
  push:
    branches: [main]  # Auto-deploy on main branch pushes
  workflow_dispatch:   # Allow manual triggers

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    # Required permissions for OIDC
    permissions:
      id-token: write   # Required to request OIDC token
      contents: read    # Required to checkout code
    
    steps:
      # Step 1: Checkout repository code
      - name: Checkout code
        uses: actions/checkout@v4
      
      # Step 2: Setup Node.js with caching
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # Cache npm dependencies
      
      # Step 3: Configure AWS credentials via OIDC
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
      
      # Step 4: Install frontend dependencies
      - name: Install dependencies
        run: npm ci
      
      # Step 5: Build frontend application
      - name: Build frontend
        run: npm run build
      
      # Step 6: Install CDK dependencies
      - name: Install CDK dependencies
        run: |
          cd infrastructure
          npm ci
      
      # Step 7: Deploy infrastructure with CDK
      - name: Deploy infrastructure
        run: |
          cd infrastructure
          npx cdk deploy --require-approval never
        env:
          CDK_DEFAULT_ACCOUNT: ${{ secrets.AWS_ACCOUNT_ID }}
          CDK_DEFAULT_REGION: us-east-1
```

### Required Repository Secrets

The workflow requires the following secrets to be configured in GitHub repository settings:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `AWS_ROLE_ARN` | ARN of the IAM role to assume | `arn:aws:iam::123456789012:role/GitHubActionsRole` |
| `AWS_ACCOUNT_ID` | AWS account ID for CDK deployment | `123456789012` |

### IAM Role Configuration

**Required Trust Policy** (allows GitHub Actions to assume the role):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:*"
        }
      }
    }
  ]
}
```

**Required Permissions Policy** (allows CDK operations):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "cloudfront:*",
        "lambda:*",
        "apigateway:*",
        "iam:*",
        "logs:*",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

## Data Models

### Workflow Inputs

```typescript
interface WorkflowInputs {
  trigger: 'push' | 'workflow_dispatch';
  branch: string;
  commitSha: string;
  actor: string; // GitHub username who triggered the workflow
}
```

### Workflow Outputs

```typescript
interface WorkflowOutputs {
  success: boolean;
  distributionUrl?: string;  // CloudFront distribution URL
  bucketName?: string;        // S3 bucket name
  apiEndpoint?: string;       // API Gateway endpoint
  deploymentTime: number;     // Duration in seconds
  errorMessage?: string;      // Error details if failed
}
```

### Build Artifacts

```typescript
interface BuildArtifacts {
  distDirectory: string;      // Path to /dist folder
  files: string[];            // List of built files
  totalSize: number;          // Total size in bytes
  buildTime: number;          // Build duration in seconds
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Build before deploy
*For any* workflow execution, the frontend build step must complete successfully before the CDK deployment step executes
**Validates: Requirements 1.5, 3.2**

### Property 2: Authentication before AWS operations
*For any* workflow execution that performs AWS operations, AWS credentials must be configured successfully before any AWS API calls are made
**Validates: Requirements 2.1, 2.5**

### Property 3: Dependency installation before build
*For any* build step, npm dependencies must be installed successfully before the build command executes
**Validates: Requirements 1.3, 1.4**

### Property 4: Fail fast on errors
*For any* workflow step that fails, all subsequent steps must not execute and the workflow must report failure status
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 5: No hardcoded credentials
*For any* workflow configuration, AWS credentials must be obtained through OIDC role assumption and not stored as plaintext secrets
**Validates: Requirements 2.2, 2.3**

### Property 6: Consistent region configuration
*For any* workflow execution, the AWS region specified in credential configuration must match the region used in CDK deployment
**Validates: Requirements 2.4, 3.3**

### Property 7: Cache utilization
*For any* workflow execution with unchanged dependencies, npm installation should use cached dependencies to reduce execution time
**Validates: Requirements 6.1, 6.5**

## Error Handling

### Build Failures

**Scenario**: TypeScript compilation or Vite build fails

**Handling**:
- Workflow halts immediately after build step
- Error output from `npm run build` is captured in logs
- GitHub sends failure notification to commit author
- No deployment occurs
- Exit code: Non-zero

**User Action**: Review build logs, fix TypeScript/build errors, push fix

### Authentication Failures

**Scenario**: OIDC authentication fails or IAM role cannot be assumed

**Handling**:
- Workflow halts at AWS credential configuration step
- Error message indicates authentication failure
- Logs show specific AWS STS error (e.g., "Not authorized to perform sts:AssumeRoleWithWebIdentity")
- No AWS operations are attempted
- Exit code: Non-zero

**User Action**: 
- Verify `AWS_ROLE_ARN` secret is correct
- Check IAM role trust policy allows GitHub Actions
- Verify OIDC provider is configured in AWS account

### CDK Deployment Failures

**Scenario**: CloudFormation stack update fails

**Handling**:
- Workflow halts at CDK deploy step
- CDK error output is captured in logs
- CloudFormation stack may be in UPDATE_ROLLBACK_IN_PROGRESS state
- Previous deployment remains active (rollback protection)
- Exit code: Non-zero

**User Action**:
- Review CDK/CloudFormation error logs
- Check AWS console for stack status
- Fix infrastructure code issues
- May need to manually resolve stack state before retry

### Dependency Installation Failures

**Scenario**: `npm ci` fails due to network issues or package conflicts

**Handling**:
- Workflow halts at dependency installation step
- npm error output is captured in logs
- Cache may be invalidated for retry
- Exit code: Non-zero

**User Action**:
- Check for package.json or package-lock.json issues
- Verify npm registry is accessible
- Re-run workflow (may succeed on retry if transient network issue)

### Timeout Handling

**Scenario**: Workflow exceeds GitHub Actions timeout (default 6 hours, but steps should complete in <10 minutes)

**Handling**:
- GitHub Actions automatically cancels workflow
- Partial progress is not committed
- Timeout error is logged
- Exit code: Timeout

**User Action**:
- Investigate which step is hanging
- Check for infinite loops or network hangs
- Optimize slow steps or increase timeout if necessary

## Testing Strategy

### Unit Testing

Since this is a workflow configuration (YAML), traditional unit tests don't apply. Instead, we use:

**1. Workflow Syntax Validation**
- Use GitHub's workflow syntax checker
- Validate YAML structure locally with `yamllint`
- Test: Ensure workflow file parses without errors

**2. Action Version Validation**
- Verify all action versions exist and are not deprecated
- Test: Check that `actions/checkout@v4`, `actions/setup-node@v4`, etc. are valid

**3. Secret Reference Validation**
- Ensure all referenced secrets are documented
- Test: Grep for `secrets.` references and verify documentation

### Integration Testing

**1. End-to-End Deployment Test**
- Trigger workflow manually via `workflow_dispatch`
- Verify all steps complete successfully
- Check that application is accessible at CloudFront URL
- Test: Complete workflow execution from trigger to deployed app

**2. Build Failure Test**
- Introduce intentional TypeScript error
- Push to test branch
- Verify workflow fails at build step
- Verify no deployment occurs
- Test: Workflow correctly halts on build errors

**3. Authentication Test**
- Temporarily use invalid IAM role ARN
- Trigger workflow
- Verify workflow fails at AWS credential configuration
- Restore correct ARN
- Test: Workflow correctly handles authentication failures

**4. CDK Deployment Test**
- Make infrastructure change (e.g., add CloudFormation output)
- Trigger workflow
- Verify CDK detects and applies change
- Check CloudFormation console for successful update
- Test: CDK deployment correctly updates infrastructure

### Property-Based Testing

Property-based testing is not directly applicable to GitHub Actions workflows, but we can verify properties through repeated executions:

**Property Test 1: Idempotency**
- Run workflow multiple times without code changes
- Verify each execution produces same result
- Verify CDK reports "no changes" on subsequent runs
- Test: Repeated deployments are idempotent

**Property Test 2: Deterministic Build**
- Run workflow multiple times with same commit
- Verify build artifacts are identical (same file hashes)
- Test: Build process is deterministic

### Manual Testing Checklist

- [ ] Workflow triggers on push to main
- [ ] Workflow can be manually triggered
- [ ] Build step compiles TypeScript without errors
- [ ] Build step produces /dist directory
- [ ] AWS authentication succeeds with OIDC
- [ ] CDK deployment updates CloudFormation stack
- [ ] Application is accessible at CloudFront URL
- [ ] Workflow fails gracefully on build errors
- [ ] Workflow fails gracefully on authentication errors
- [ ] Workflow logs are clear and helpful for debugging
- [ ] npm caching reduces dependency installation time
- [ ] Complete workflow finishes in under 10 minutes

## Performance Considerations

### Optimization Strategies

**1. npm Caching**
- Use `actions/setup-node@v4` with `cache: 'npm'`
- Caches `~/.npm` directory based on `package-lock.json` hash
- Reduces dependency installation from ~2 minutes to ~30 seconds on cache hit
- Cache is automatically invalidated when `package-lock.json` changes

**2. Parallel Execution**
- Current workflow is sequential (each step depends on previous)
- Future optimization: Split into multiple jobs
  - Job 1: Build frontend
  - Job 2: Deploy infrastructure (depends on Job 1)
- Allows parallel execution of independent tasks

**3. Conditional Steps**
- Use `if` conditions to skip unnecessary steps
- Example: Skip deployment on draft PRs
- Reduces workflow time for non-deployment scenarios

**4. Artifact Caching**
- Cache TypeScript build output (`tsconfig.tsbuildinfo`)
- Speeds up incremental TypeScript compilation
- Reduces build time for small changes

### Performance Targets

| Metric | Target | Typical |
|--------|--------|---------|
| Checkout code | < 10s | 5s |
| Setup Node.js (cache hit) | < 30s | 20s |
| Setup Node.js (cache miss) | < 2m | 90s |
| Configure AWS credentials | < 10s | 5s |
| Install frontend deps (cache hit) | < 30s | 20s |
| Install frontend deps (cache miss) | < 2m | 90s |
| Build frontend | < 2m | 60s |
| Install CDK deps | < 1m | 30s |
| Deploy infrastructure (no changes) | < 2m | 60s |
| Deploy infrastructure (with changes) | < 5m | 180s |
| **Total (cache hit, no infra changes)** | **< 5m** | **3m** |
| **Total (cache miss, with infra changes)** | **< 10m** | **7m** |

### Monitoring and Metrics

**GitHub Actions Metrics** (available in Actions tab):
- Workflow run duration
- Step-by-step timing
- Success/failure rate
- Cache hit rate

**AWS CloudWatch Metrics** (for deployed resources):
- CloudFormation stack update duration
- Lambda cold start times
- API Gateway request latency

## Security Considerations

### OIDC vs. Long-Lived Credentials

**Why OIDC is Preferred**:
- No long-lived AWS access keys stored in GitHub
- Temporary credentials expire after workflow completes
- Credentials are scoped to specific repository
- Reduces risk of credential leakage
- Follows AWS security best practices

**OIDC Setup Requirements**:
1. Create OIDC identity provider in AWS IAM
2. Create IAM role with trust policy for GitHub
3. Configure role ARN in GitHub secrets
4. Workflow requests token and assumes role

### Least Privilege Principle

**IAM Role Permissions**:
- Grant only permissions required for CDK deployment
- Use resource-level restrictions where possible
- Example: Restrict S3 actions to specific bucket ARN
- Regularly audit and tighten permissions

**GitHub Workflow Permissions**:
- Explicitly declare required permissions in workflow
- `id-token: write` - Required for OIDC
- `contents: read` - Required for checkout
- No additional permissions granted

### Secret Management

**Repository Secrets**:
- `AWS_ROLE_ARN` - Not sensitive (ARN is not a credential)
- `AWS_ACCOUNT_ID` - Not sensitive (account ID is not a credential)
- Secrets are encrypted at rest by GitHub
- Secrets are masked in workflow logs

**Environment Variables**:
- `CDK_DEFAULT_ACCOUNT` - Passed as environment variable
- `CDK_DEFAULT_REGION` - Passed as environment variable
- No sensitive data in environment variables

### Audit and Compliance

**Workflow Logs**:
- All workflow executions are logged
- Logs retained for 90 days (GitHub default)
- Logs include who triggered workflow and when
- Logs show all executed commands (secrets masked)

**AWS CloudTrail**:
- All AWS API calls are logged in CloudTrail
- Can trace which actions were performed by GitHub Actions role
- Useful for security audits and compliance

## Deployment Process

### Initial Setup

**Step 1: Configure AWS OIDC Provider**

```bash
# Create OIDC provider in AWS (one-time setup)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

**Step 2: Create IAM Role**

```bash
# Create IAM role with trust policy (see IAM Role Configuration section)
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://trust-policy.json

# Attach permissions policy
aws iam put-role-policy \
  --role-name GitHubActionsRole \
  --policy-name CDKDeploymentPolicy \
  --policy-document file://permissions-policy.json
```

**Step 3: Configure GitHub Secrets**

1. Go to repository Settings → Secrets and variables → Actions
2. Add `AWS_ROLE_ARN`: `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole`
3. Add `AWS_ACCOUNT_ID`: Your AWS account ID

**Step 4: Test Workflow**

1. Trigger workflow manually via Actions tab
2. Monitor execution and verify all steps succeed
3. Check deployed application at CloudFront URL

### Ongoing Deployments

**Automatic Deployment**:
- Push code to `main` branch
- Workflow triggers automatically
- Monitor progress in Actions tab
- Verify deployment at CloudFront URL

**Manual Deployment**:
- Go to Actions tab
- Select "Deploy to AWS" workflow
- Click "Run workflow"
- Select branch (usually `main`)
- Click "Run workflow" button

### Rollback Procedure

**If Deployment Fails**:
1. CloudFormation automatically rolls back to previous state
2. Previous deployment remains active
3. Fix issues in code
4. Push fix to trigger new deployment

**Manual Rollback**:
1. Go to AWS CloudFormation console
2. Find stack (e.g., `GhostInTheCodeStack`)
3. Select "Stack actions" → "Roll back"
4. Or redeploy previous commit via GitHub Actions

## Future Enhancements

### Testing Integration

- Add test step before deployment
- Run `npm test` to execute Vitest tests
- Only deploy if tests pass
- Property: Tests must pass before deployment

### Multi-Environment Support

- Add staging and production environments
- Use different AWS accounts or regions
- Deploy to staging on PR, production on merge to main
- Environment-specific secrets and configurations

### Deployment Notifications

- Send Slack/Discord notification on deployment success/failure
- Include deployment URL and commit details
- Notify team of production deployments

### Performance Monitoring

- Collect and report workflow execution metrics
- Track deployment duration trends
- Alert on slow or failing deployments

### Advanced Caching

- Cache CDK CloudFormation templates
- Cache Lambda function bundles
- Reduce deployment time for unchanged resources

### Blue-Green Deployments

- Deploy to new CloudFront distribution
- Test new deployment
- Switch DNS/traffic to new deployment
- Keep old deployment for quick rollback
