# PowerShell script to deploy Redis and test connectivity

$ErrorActionPreference = "Stop"
$NAMESPACE = "mentorplatform"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Deploying Redis Cache" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Create namespace
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy Redis
kubectl apply -f redis.yaml

# Wait for Redis to be ready
Write-Host "Waiting for Redis to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=180s deployment/redis -n $NAMESPACE

Write-Host ""
Write-Host "✓ Redis deployed successfully!" -ForegroundColor Green
Write-Host ""

# Test Redis
Write-Host "Testing Redis connection..." -ForegroundColor Yellow
kubectl run redis-test --rm -it --image=redis:7-alpine -n $NAMESPACE -- redis-cli -h redis ping

Write-Host ""
Write-Host "Redis service info:" -ForegroundColor Cyan
kubectl get svc redis -n $NAMESPACE
Write-Host ""
Write-Host "Redis connection string: redis:6379" -ForegroundColor Green
