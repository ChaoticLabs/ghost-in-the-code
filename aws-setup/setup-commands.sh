#!/bin/bash

# AWS OIDC Setup Script for GitHub Actions
# Replace the placeholders before running!

# Configuration - UPDATE THESE VALUES
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"           # e.g., 123456789012
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"     # e.g., johndoe
REPO_NAME="YOUR_REPO_NAME"                 # e.g., ghost-in-the-code
ROLE_NAME="GitHubActionsRole"

echo "========================================="
echo "GitHub Actions OIDC Setup for AWS"
echo "========================================="
echo ""
echo "Configuration:"
echo "  AWS Account ID: $AWS_ACCOUNT_ID"
echo "  GitHub Repo: $GITHUB_USERNAME/$REPO_NAME"
echo "  IAM Role Name: $ROLE_NAME"
echo ""

# Step 1: Create OIDC Provider
echo "Step 1: Creating OIDC Identity Provider..."
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  2>/dev/null

if [ $? -eq 0 ]; then
  echo "✓ OIDC provider created successfully"
else
  echo "⚠ OIDC provider may already exist (this is okay)"
fi

# Step 2: Create trust policy with actual values
echo ""
echo "Step 2: Creating trust policy..."
cat > trust-policy-generated.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_USERNAME}/${REPO_NAME}:*"
        }
      }
    }
  ]
}
EOF

echo "✓ Trust policy created: trust-policy-generated.json"

# Step 3: Create IAM role
echo ""
echo "Step 3: Creating IAM role..."
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document file://trust-policy-generated.json

if [ $? -eq 0 ]; then
  echo "✓ IAM role created successfully"
else
  echo "✗ Failed to create IAM role (may already exist)"
fi

# Step 4: Attach permissions policy
echo ""
echo "Step 4: Attaching permissions policy..."
aws iam put-role-policy \
  --role-name $ROLE_NAME \
  --policy-name CDKDeploymentPolicy \
  --policy-document file://permissions-policy.json

if [ $? -eq 0 ]; then
  echo "✓ Permissions policy attached successfully"
else
  echo "✗ Failed to attach permissions policy"
fi

# Step 5: Get role ARN
echo ""
echo "Step 5: Retrieving role ARN..."
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Add these secrets to your GitHub repository:"
echo ""
echo "Secret Name: AWS_ROLE_ARN"
echo "Secret Value: $ROLE_ARN"
echo ""
echo "Secret Name: AWS_ACCOUNT_ID"
echo "Secret Value: $AWS_ACCOUNT_ID"
echo ""
echo "To add secrets:"
echo "1. Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Add both secrets above"
echo ""
