# GitHub Actions OIDC Setup for AWS

This guide walks you through setting up OpenID Connect (OIDC) authentication between GitHub Actions and AWS, allowing secure deployments without storing long-lived AWS credentials.

## Overview

OIDC allows GitHub Actions to authenticate with AWS using temporary credentials. This is more secure than storing AWS access keys because:
- No long-lived credentials are stored in GitHub
- Temporary credentials expire automatically after the workflow completes
- Access is scoped to your specific repository
- Follows AWS security best practices

## Prerequisites

- AWS CLI installed and configured with admin access
- Access to your GitHub repository settings
- Your AWS account ID (12 digits)
- Your GitHub username and repository name

## Quick Setup (Automated)

If you prefer an automated setup, use the provided script:

```bash
cd aws-setup

# Edit setup-commands.sh and update these values:
# - AWS_ACCOUNT_ID
# - GITHUB_USERNAME
# - REPO_NAME

# Run the script
bash setup-commands.sh
```

The script will create all necessary resources and output the secrets you need to add to GitHub.

## Manual Setup (Step-by-Step)

### Step 1: Create OIDC Identity Provider

This is a one-time setup per AWS account. The OIDC provider allows GitHub to authenticate with AWS.

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

**Verify it was created:**
```bash
aws iam list-open-id-connect-providers
```

You should see: `arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com`

**Note:** If the provider already exists, you'll get an error. This is fine - you can skip to Step 2.

---

### Step 2: Create IAM Role with Trust Policy

The IAM role defines who can assume it (GitHub Actions) and what permissions it has.

#### 2a. Configure Trust Policy

The trust policy is already provided in `trust-policy.json`. Update the placeholders:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
```

**Replace:**
- `YOUR_ACCOUNT_ID` - Your 12-digit AWS account ID
- `YOUR_GITHUB_USERNAME` - Your GitHub username (e.g., `johndoe`)
- `YOUR_REPO_NAME` - Your repository name (e.g., `ghost-in-the-code`)

**Important:** The `sub` condition uses `StringLike` with `:*` at the end to allow all branches and tags.

#### 2b. Create the IAM Role

```bash
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://trust-policy.json
```

**Verify and get the Role ARN:**
```bash
aws iam get-role --role-name GitHubActionsRole --query 'Role.Arn' --output text
```

**Save this ARN!** You'll need it for GitHub secrets. It looks like:
`arn:aws:iam::123456789012:role/GitHubActionsRole`

---

### Step 3: Attach Permissions Policy

The permissions policy defines what AWS actions the role can perform.

#### 3a. Review Permissions Policy

The permissions policy is provided in `permissions-policy.json`:

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
        "ssm:GetParameter",
        "ssm:PutParameter",
        "sts:AssumeRole",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

**Required Permissions Explained:**
- `cloudformation:*` - Deploy and manage CDK stacks
- `s3:*` - Create buckets and upload website files
- `cloudfront:*` - Create and manage CloudFront distributions
- `lambda:*` - Deploy Lambda functions
- `apigateway:*` - Create API Gateway endpoints
- `iam:*` - Create roles for Lambda functions
- `logs:*` - Create CloudWatch log groups
- `ssm:*` - Store/retrieve parameters
- `sts:*` - Verify credentials

**Security Note:** This policy grants broad permissions suitable for CDK deployments. For production, consider restricting to specific resources.

#### 3b. Attach the Policy to the Role

```bash
aws iam put-role-policy \
  --role-name GitHubActionsRole \
  --policy-name CDKDeploymentPolicy \
  --policy-document file://permissions-policy.json
```

**Verify the policy was attached:**
```bash
aws iam list-role-policies --role-name GitHubActionsRole
```

You should see `CDKDeploymentPolicy` in the output.

---

### Step 4: Configure GitHub Repository Secrets

GitHub secrets store sensitive values that workflows can access securely.

#### 4a. Navigate to Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

#### 4b. Add AWS_ROLE_ARN Secret

- **Name:** `AWS_ROLE_ARN`
- **Value:** The role ARN from Step 2b (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole`)

Click **Add secret**

#### 4c. Add AWS_ACCOUNT_ID Secret

- **Name:** `AWS_ACCOUNT_ID`
- **Value:** Your 12-digit AWS account ID (e.g., `123456789012`)

Click **Add secret**

**To get your AWS account ID:**
```bash
aws sts get-caller-identity --query Account --output text
```

---

## Verification

### Test Your Setup

1. Go to your repository's **Actions** tab
2. Select the **Deploy to AWS** workflow
3. Click **Run workflow** → **Run workflow**
4. Monitor the workflow execution

If everything is configured correctly:
- ✅ Checkout step succeeds
- ✅ AWS credentials configuration succeeds
- ✅ Build and deployment proceed

### Verification Script

Run this script to check your AWS setup:

```bash
#!/bin/bash

echo "=== AWS OIDC Setup Verification ==="
echo ""

# Check OIDC provider
echo "1. Checking OIDC provider..."
OIDC_PROVIDER=$(aws iam list-open-id-connect-providers --query 'OpenIDConnectProviderList[?contains(Arn, `token.actions.githubusercontent.com`)].Arn' --output text)
if [ -n "$OIDC_PROVIDER" ]; then
  echo "   ✓ OIDC provider exists: $OIDC_PROVIDER"
else
  echo "   ✗ OIDC provider NOT found"
fi

echo ""

# Check IAM role
echo "2. Checking IAM role..."
ROLE_ARN=$(aws iam get-role --role-name GitHubActionsRole --query 'Role.Arn' --output text 2>/dev/null)
if [ -n "$ROLE_ARN" ]; then
  echo "   ✓ IAM role exists: $ROLE_ARN"
else
  echo "   ✗ IAM role NOT found"
fi

echo ""

# Check role policy
echo "3. Checking role policy..."
POLICY=$(aws iam list-role-policies --role-name GitHubActionsRole --query 'PolicyNames' --output text 2>/dev/null)
if [ -n "$POLICY" ]; then
  echo "   ✓ Policy attached: $POLICY"
else
  echo "   ✗ No policy attached"
fi

echo ""

# Get account ID
echo "4. Your AWS Account ID:"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "   $ACCOUNT_ID"

echo ""
echo "=== Summary ==="
echo "Add these secrets to GitHub:"
echo "  AWS_ROLE_ARN: $ROLE_ARN"
echo "  AWS_ACCOUNT_ID: $ACCOUNT_ID"
```

---

## Troubleshooting

### Error: "Request ARN is invalid"

**Causes:**
- ARN format is incorrect (typos, missing parts)
- Role doesn't exist in AWS
- Secret not configured in GitHub

**Fix:**
1. Verify the role exists:
   ```bash
   aws iam get-role --role-name GitHubActionsRole
   ```
2. Copy the exact ARN from the output
3. Update the `AWS_ROLE_ARN` secret in GitHub with the exact value

---

### Error: "Not authorized to perform sts:AssumeRoleWithWebIdentity"

**Causes:**
- OIDC provider not created
- Trust policy is incorrect
- Repository name in trust policy doesn't match actual repository

**Fix:**
1. Verify OIDC provider exists:
   ```bash
   aws iam list-open-id-connect-providers
   ```
2. Check trust policy has correct repository:
   ```bash
   aws iam get-role --role-name GitHubActionsRole --query 'Role.AssumeRolePolicyDocument'
   ```
3. Ensure the `sub` condition matches: `repo:USERNAME/REPO:*`
4. Verify `StringLike` is used (not `StringEquals`) for the sub claim

---

### Error: "No OpenIDConnect provider found"

**Cause:** OIDC provider not created in AWS

**Fix:** Run Step 1 to create the OIDC provider

---

### Error: "Access Denied" during deployment

**Causes:**
- Permissions policy is missing required actions
- Policy not attached to role

**Fix:**
1. Verify policy is attached:
   ```bash
   aws iam list-role-policies --role-name GitHubActionsRole
   ```
2. Check policy contents:
   ```bash
   aws iam get-role-policy --role-name GitHubActionsRole --policy-name CDKDeploymentPolicy
   ```
3. Re-attach the policy if needed (Step 3b)

---

### Workflow runs but secrets are empty

**Cause:** Secrets not configured in GitHub or named incorrectly

**Fix:**
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Verify both secrets exist: `AWS_ROLE_ARN` and `AWS_ACCOUNT_ID`
3. Check for typos in secret names (they're case-sensitive)
4. Re-create secrets if needed

---

## Security Best Practices

### Principle of Least Privilege

The provided permissions policy grants broad access suitable for CDK deployments. For production environments, consider:

1. **Restrict to specific resources:**
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

2. **Limit CloudFormation to specific stacks:**
   ```json
   {
     "Effect": "Allow",
     "Action": "cloudformation:*",
     "Resource": "arn:aws:cloudformation:us-east-1:ACCOUNT_ID:stack/YourStackName/*"
   }
   ```

### Audit and Monitoring

1. **Enable CloudTrail** to log all API calls made by the GitHub Actions role
2. **Review CloudTrail logs** periodically for unexpected activity
3. **Set up CloudWatch alarms** for suspicious actions
4. **Rotate credentials** if you suspect compromise (delete and recreate the role)

### Repository Protection

1. **Restrict who can trigger workflows** by limiting repository write access
2. **Require pull request reviews** before merging to main branch
3. **Use branch protection rules** to prevent direct pushes to main
4. **Enable secret scanning** in GitHub repository settings

---

## Additional Resources

- [AWS OIDC Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [GitHub Actions OIDC Guide](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## Summary

You've successfully configured OIDC authentication between GitHub Actions and AWS! Your workflow can now:

✅ Authenticate securely without storing AWS credentials  
✅ Deploy infrastructure using AWS CDK  
✅ Build and deploy your application automatically  

**Next Steps:**
1. Push code to the `main` branch to trigger automatic deployment
2. Or manually trigger the workflow from the Actions tab
3. Monitor deployment progress in the GitHub Actions UI
4. Access your deployed application at the CloudFront URL
