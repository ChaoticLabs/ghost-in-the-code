# GitHub Actions CI/CD

## Overview

Automated deployments using GitHub Actions with OIDC authentication - no long-lived AWS credentials needed.

## Benefits of OIDC

- No AWS access keys stored in GitHub
- Temporary credentials expire automatically
- Access scoped to your specific repository
- Follows AWS security best practices

## Quick Setup

### Prerequisites
- AWS CLI with admin access
- GitHub repository access
- AWS account ID (12 digits)

### Automated Setup

```bash
cd aws-setup

# Edit setup-commands.sh and update:
# - AWS_ACCOUNT_ID
# - GITHUB_USERNAME
# - REPO_NAME

bash setup-commands.sh
```

The script creates all necessary resources and outputs the secrets for GitHub.

## Manual Setup

### Step 1: Create OIDC Provider (One-time per AWS account)

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

Verify:
```bash
aws iam list-open-id-connect-providers
```

### Step 2: Create IAM Role

Edit `aws-setup/trust-policy.json` with your values:
- `YOUR_ACCOUNT_ID`
- `YOUR_GITHUB_USERNAME`
- `YOUR_REPO_NAME`

Create role:
```bash
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://aws-setup/trust-policy.json
```

Get the ARN (save this):
```bash
aws iam get-role --role-name GitHubActionsRole --query 'Role.Arn' --output text
```

### Step 3: Attach Permissions

```bash
aws iam put-role-policy \
  --role-name GitHubActionsRole \
  --policy-name CDKDeploymentPolicy \
  --policy-document file://aws-setup/permissions-policy.json
```

### Step 4: Configure GitHub Secrets

Go to repository **Settings** → **Secrets and variables** → **Actions**

Add two secrets:

1. **AWS_ROLE_ARN**
   - Value: ARN from Step 2 (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole`)

2. **AWS_ACCOUNT_ID**
   - Value: Your 12-digit AWS account ID

Get account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

## Verification

### Test Deployment

1. Go to repository **Actions** tab
2. Select **Deploy to AWS** workflow
3. Click **Run workflow**
4. Monitor execution

Expected results:
- ✅ Checkout succeeds
- ✅ AWS credentials configured
- ✅ Build and deployment complete

### Verification Script

```bash
#!/bin/bash
echo "=== AWS OIDC Setup Verification ==="

# Check OIDC provider
OIDC_PROVIDER=$(aws iam list-open-id-connect-providers \
  --query 'OpenIDConnectProviderList[?contains(Arn, `token.actions.githubusercontent.com`)].Arn' \
  --output text)
echo "OIDC Provider: ${OIDC_PROVIDER:-NOT FOUND}"

# Check IAM role
ROLE_ARN=$(aws iam get-role --role-name GitHubActionsRole \
  --query 'Role.Arn' --output text 2>/dev/null)
echo "IAM Role: ${ROLE_ARN:-NOT FOUND}"

# Check policy
POLICY=$(aws iam list-role-policies --role-name GitHubActionsRole \
  --query 'PolicyNames' --output text 2>/dev/null)
echo "Policy: ${POLICY:-NOT FOUND}"

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"

echo ""
echo "Add these to GitHub secrets:"
echo "  AWS_ROLE_ARN: $ROLE_ARN"
echo "  AWS_ACCOUNT_ID: $ACCOUNT_ID"
```

## Troubleshooting

### "Request ARN is invalid"
- Verify role exists: `aws iam get-role --role-name GitHubActionsRole`
- Check ARN format in GitHub secret
- Ensure no typos or extra spaces

### "Not authorized to perform sts:AssumeRoleWithWebIdentity"
- Verify OIDC provider exists
- Check trust policy has correct repository name
- Ensure `StringLike` is used for `sub` condition (not `StringEquals`)

### "Access Denied" during deployment
- Verify policy is attached: `aws iam list-role-policies --role-name GitHubActionsRole`
- Check policy has required permissions
- Re-attach policy if needed

### Secrets are empty in workflow
- Verify secrets exist in GitHub repository settings
- Check secret names are exact (case-sensitive)
- Re-create secrets if needed

## Security Best Practices

### Least Privilege
For production, restrict permissions to specific resources:

```json
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": [
    "arn:aws:s3:::your-specific-bucket",
    "arn:aws:s3:::your-specific-bucket/*"
  ]
}
```

### Monitoring
- Enable CloudTrail for API call logging
- Review logs periodically
- Set up CloudWatch alarms for suspicious activity
- Rotate credentials if compromise suspected

### Repository Protection
- Limit who can trigger workflows
- Require PR reviews before merging
- Use branch protection rules
- Enable secret scanning

## Workflow Configuration

The workflow is defined in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
      
      - name: Deploy
        run: |
          cd infrastructure
          npm install
          npm run deploy:full
```

## Resources

- [AWS OIDC Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [GitHub Actions OIDC Guide](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
