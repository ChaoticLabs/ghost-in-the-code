# Deployment script for Ghost in The Code (PowerShell)

Write-Host "Building Vite application..." -ForegroundColor Cyan
Set-Location ..
npm install
npm run build
Set-Location infrastructure

Write-Host "Deploying CDK stack..." -ForegroundColor Cyan
npm run deploy

Write-Host "Deployment complete!" -ForegroundColor Green
