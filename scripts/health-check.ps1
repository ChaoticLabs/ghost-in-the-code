# Health Check Script for Ghost in The Code (PowerShell)
# Checks deployment status and service health

Write-Host "🔍 Ghost in The Code - Health Check" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "   Voice features may not be available"
    Write-Host ""
}

# Check Node.js version
Write-Host "📦 Checking Node.js version..."
try {
    $nodeVersion = node -v
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -ge 20) {
        Write-Host "✓ Node.js $nodeVersion (required: >=20.x)" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js $nodeVersion (required: >=20.x)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check npm dependencies
Write-Host "📦 Checking dependencies..."
if (Test-Path node_modules) {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Dependencies not installed" -ForegroundColor Red
    Write-Host "   Run: npm install"
    exit 1
}
Write-Host ""

# Check if build exists
Write-Host "🏗️  Checking build..."
if (Test-Path dist) {
    Write-Host "✓ Build directory exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Build directory not found" -ForegroundColor Yellow
    Write-Host "   Run: npm run build"
}
Write-Host ""

# Check AWS credentials (if deploying)
Write-Host "☁️  Checking AWS configuration..."
try {
    $awsIdentity = aws sts get-caller-identity 2>$null | ConvertFrom-Json
    if ($awsIdentity) {
        Write-Host "✓ AWS credentials configured (Account: $($awsIdentity.Account))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: AWS credentials not configured" -ForegroundColor Yellow
        Write-Host "   Required for deployment only"
    }
} catch {
    Write-Host "⚠️  Warning: AWS CLI not installed or not configured" -ForegroundColor Yellow
    Write-Host "   Required for deployment only"
}
Write-Host ""

# Check API endpoint (if configured)
if (Test-Path .env) {
    $envContent = Get-Content .env
    $apiLine = $envContent | Where-Object { $_ -match 'VITE_API_ENDPOINT' }
    
    if ($apiLine) {
        $apiEndpoint = ($apiLine -split '=')[1].Trim('"').Trim("'")
        
        if ($apiEndpoint) {
            Write-Host "🌐 Checking API endpoint..."
            Write-Host "   Endpoint: $apiEndpoint"
            
            try {
                $response = Invoke-WebRequest -Uri "${apiEndpoint}voice" -Method POST `
                    -ContentType "application/json" `
                    -Body '{"text":"test"}' `
                    -UseBasicParsing `
                    -ErrorAction SilentlyContinue
                
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 400) {
                    Write-Host "✓ API endpoint is reachable (HTTP $($response.StatusCode))" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  Warning: API endpoint returned HTTP $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "⚠️  Warning: Could not reach API endpoint" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠️  Warning: API endpoint not configured in .env" -ForegroundColor Yellow
            Write-Host "   Voice features will not work"
        }
    }
}
Write-Host ""

# Check infrastructure deployment (if CDK is available)
if (Test-Path infrastructure) {
    Write-Host "🏗️  Checking infrastructure..."
    if (Test-Path infrastructure/cdk.out/manifest.json) {
        Write-Host "✓ CDK synthesis output exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: CDK not synthesized" -ForegroundColor Yellow
        Write-Host "   Run: cd infrastructure; npm run synth"
    }
}
Write-Host ""

# Summary
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✓ Health check complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  • Local dev: npm run dev"
Write-Host "  • Build: npm run build"
Write-Host "  • Deploy: cd infrastructure; npm run deploy:full"
Write-Host ""
