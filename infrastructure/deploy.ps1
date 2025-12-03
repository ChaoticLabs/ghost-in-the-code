# Deployment script for Ghost in The Code (PowerShell)

# Check for domain configuration
$domainName = $env:DOMAIN_NAME
$hostedZoneName = $env:HOSTED_ZONE_NAME

if ($domainName -and $hostedZoneName) {
    Write-Host "✓ Custom domain configuration detected:" -ForegroundColor Green
    Write-Host "  Domain: $domainName" -ForegroundColor White
    Write-Host "  Hosted Zone: $hostedZoneName" -ForegroundColor White
    Write-Host ""
} elseif ($domainName -or $hostedZoneName) {
    Write-Host "⚠ Warning: Incomplete domain configuration detected" -ForegroundColor Yellow
    Write-Host "  Required variables: DOMAIN_NAME, HOSTED_ZONE_NAME" -ForegroundColor White
    Write-Host "  Deploying without custom domain..." -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ℹ No custom domain configuration found" -ForegroundColor Cyan
    Write-Host "  Deploying with default CloudFront domain" -ForegroundColor White
    Write-Host "  To use a custom domain, set: DOMAIN_NAME, HOSTED_ZONE_NAME" -ForegroundColor White
    Write-Host ""
}

Write-Host "Building Vite application..." -ForegroundColor Cyan
Set-Location ..
npm install
npm run build
Set-Location infrastructure

Write-Host "Deploying CDK stack..." -ForegroundColor Cyan
npm run deploy

Write-Host "Deployment complete!" -ForegroundColor Green
