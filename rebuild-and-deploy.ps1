# Rebuild and Deploy Script for MentorPlatform
# This script rebuilds the Docker images and restarts deployments

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Rebuilding and Deploying MentorPlatform" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Configure Docker to use Minikube
Write-Host "Step 1: Configuring Docker environment..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
Write-Host "✓ Docker configured to use Minikube" -ForegroundColor Green
Write-Host ""

# Step 2: Rebuild Backend API image
Write-Host "Step 2: Building Backend API Docker image..." -ForegroundColor Yellow
Set-Location be\src
docker build -t mentorplatform-api:latest -f MentorPlatform.API\Dockerfile .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend API image built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to build Backend API image" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Rebuild API Gateway image
Write-Host "Step 3: Building API Gateway Docker image..." -ForegroundColor Yellow
docker build -t mentorplatform-gateway:latest -f MentorPlatform.Gateway\Dockerfile .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ API Gateway image built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to build API Gateway image" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Go back to root
Set-Location ..\..\

# Step 4: Restart Backend API deployment
Write-Host "Step 4: Restarting Backend API deployment..." -ForegroundColor Yellow
kubectl rollout restart deployment/mentorplatform-api -n mentorplatform
Write-Host "Waiting for API rollout to complete..." -ForegroundColor Blue
kubectl rollout status deployment/mentorplatform-api -n mentorplatform --timeout=300s
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend API restarted successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Backend API restart timed out" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Restart Gateway deployment
Write-Host "Step 5: Restarting API Gateway deployment..." -ForegroundColor Yellow
kubectl rollout restart deployment/mentorplatform-gateway -n default
Write-Host "Waiting for Gateway rollout to complete..." -ForegroundColor Blue
kubectl rollout status deployment/mentorplatform-gateway -n default --timeout=300s
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ API Gateway restarted successfully" -ForegroundColor Green
} else {
    Write-Host "✗ API Gateway restart timed out" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 6: Verify deployments
Write-Host "Step 6: Verifying deployments..." -ForegroundColor Yellow
Write-Host ""
Write-Host "API Deployment Status:" -ForegroundColor Blue
kubectl get deployment mentorplatform-api -n mentorplatform
Write-Host ""
Write-Host "Gateway Deployment Status:" -ForegroundColor Blue
kubectl get deployment mentorplatform-gateway -n default
Write-Host ""

# Step 7: Test the endpoint
Write-Host "Step 7: Testing API endpoints..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Testing direct API access (http://localhost:32080/api/expertises)..." -ForegroundColor Blue
$apiTest = Invoke-WebRequest -Uri "http://localhost:32080/api/expertises" -UseBasicParsing -ErrorAction SilentlyContinue
if ($apiTest -and $apiTest.StatusCode -eq 200) {
    Write-Host "✓ Direct API access successful" -ForegroundColor Green
} else {
    Write-Host "✗ Direct API access failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "Testing Gateway access (http://localhost:30000/api/expertises)..." -ForegroundColor Blue
$gatewayTest = Invoke-WebRequest -Uri "http://localhost:30000/api/expertises" -UseBasicParsing -ErrorAction SilentlyContinue
if ($gatewayTest -and $gatewayTest.StatusCode -eq 200) {
    Write-Host "✓ Gateway access successful" -ForegroundColor Green
} else {
    Write-Host "✗ Gateway access failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Rebuild and Deploy Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoints:" -ForegroundColor Blue
Write-Host "  Gateway:  http://localhost:30000/api/expertises" -ForegroundColor Yellow
Write-Host "  Direct:   http://localhost:32080/api/expertises" -ForegroundColor Yellow
Write-Host ""
