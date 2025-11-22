# AWS OIDC Setup for GitHub Actions

## 1. Create OIDC Identity Provider in AWS

1. Go to AWS Console → IAM → Identity providers
2. Click "Add provider"
3. Select "OpenID Connect"
4. Provider URL: `https://token.actions.githubusercontent.com`
5. Audience: `sts.amazonaws.com`
6. Click "Add provider"

## 2. Create IAM Role for GitHub Actions

1. Go to IAM → Roles → Create role
2. Select "Web identity"
3. Identity provider: `token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Add condition:
   ```json
   {
     "StringEquals": {
       "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
     },
     "StringLike": {
       "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/ghost-in-the-code:*"
     }
   }
   ```
6. Attach policies:
   - `PowerUserAccess` (or create custom policy with CDK permissions)
7. Name the role: `GitHubActionsRole`
8. Copy the Role ARN

## 3. Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:
- `AWS_ROLE_ARN`: The ARN from step 2 (e.g., `arn:aws:iam::687611153613:role/GitHubActionsRole`)
- `AWS_ACCOUNT_ID`: `687611153613`

## 4. Local Development Options

### Option A: AWS CLI (Recommended)
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key  
# Enter region: us-east-1
# Enter output format: json
```

### Option B: Environment Variables
Add to your `.env` file:
```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_DEFAULT_REGION=us-east-1
```

## 5. Test Deployment

Local:
```bash
cd infrastructure
npx cdk deploy
```

GitHub Actions will deploy automatically on push to main branch.