# Complete deployment script for MentorPlatform with API Gateway
# PowerShell version

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  MentorPlatform Complete Deployment with Gateway" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Blue
$commands = @('minikube', 'kubectl', 'docker')
foreach ($cmd in $commands) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "✗ $cmd is required but not installed." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ All prerequisites found" -ForegroundColor Green
Write-Host ""

# Start Minikube if not running
try {
    minikube status | Out-Null
    Write-Host "✓ Minikube is already running" -ForegroundColor Green
} catch {
    Write-Host "Starting Minikube..." -ForegroundColor Yellow
    minikube start --cpus=4 --memory=8192
}
Write-Host ""

# Configure Docker to use Minikube's Docker daemon
Write-Host "Configuring Docker environment..." -ForegroundColor Blue
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
Write-Host "✓ Docker configured" -ForegroundColor Green
Write-Host ""

# Build Backend API
Write-Host "Building Backend API Docker image..." -ForegroundColor Yellow
Set-Location be\src
docker build -t mentorplatform-api:latest -f MentorPlatform.API\Dockerfile .
Write-Host "✓ Backend API image built" -ForegroundColor Green
Write-Host ""

# Build API Gateway
Write-Host "Building API Gateway Docker image..." -ForegroundColor Yellow
docker build -t mentorplatform-gateway:latest -f MentorPlatform.Gateway\Dockerfile .
Write-Host "✓ API Gateway image built" -ForegroundColor Green
Write-Host ""

# Build Frontend
Write-Host "Building Frontend Docker image..." -ForegroundColor Yellow
Set-Location ..\..\fe
docker build -t mentorplatform-fe:latest .
Write-Host "✓ Frontend image built" -ForegroundColor Green
Write-Host ""

Set-Location ..

# Deploy Redis Cache
Write-Host "Deploying Redis Cache..." -ForegroundColor Yellow
kubectl apply -f be\src\MentorPlatform.API\k8s\redis.yaml
Write-Host "✓ Redis deployed" -ForegroundColor Green
Write-Host ""

# Wait for Redis to be ready
Write-Host "Waiting for Redis to be ready..." -ForegroundColor Blue
kubectl wait --for=condition=ready pod -l app=redis -n mentorplatform --timeout=300s
Write-Host "✓ Redis is ready" -ForegroundColor Green
Write-Host ""

# Deploy RabbitMQ
Write-Host "Deploying RabbitMQ Message Broker..." -ForegroundColor Yellow
kubectl apply -f be\src\MentorPlatform.API\k8s\rabbitmq.yaml
Write-Host "✓ RabbitMQ deployed" -ForegroundColor Green
Write-Host ""

# Wait for RabbitMQ to be ready
Write-Host "Waiting for RabbitMQ to be ready..." -ForegroundColor Blue
kubectl wait --for=condition=ready pod -l app=rabbitmq -n mentorplatform --timeout=300s
Write-Host "✓ RabbitMQ is ready" -ForegroundColor Green
Write-Host ""

# Deploy Backend API
Write-Host "Deploying Backend API..." -ForegroundColor Yellow
kubectl apply -f be\src\MentorPlatform.API\k8s\configmap.yaml
kubectl apply -f be\src\MentorPlatform.API\k8s\secret.yaml
kubectl apply -f be\src\MentorPlatform.API\k8s\deployment.yaml
kubectl apply -f be\src\MentorPlatform.API\k8s\service.yaml
Write-Host "✓ Backend API deployed" -ForegroundColor Green
Write-Host ""

# Wait for backend to be ready
Write-Host "Waiting for Backend API to be ready..." -ForegroundColor Blue
kubectl rollout status deployment/mentorplatform-api --timeout=300s
Write-Host "✓ Backend API is ready" -ForegroundColor Green
Write-Host ""

# Deploy API Gateway
Write-Host "Deploying API Gateway..." -ForegroundColor Yellow
kubectl apply -f be\src\MentorPlatform.Gateway\k8s\configmap.yaml
kubectl apply -f be\src\MentorPlatform.Gateway\k8s\deployment.yaml
kubectl apply -f be\src\MentorPlatform.Gateway\k8s\service.yaml
kubectl apply -f be\src\MentorPlatform.Gateway\k8s\hpa.yaml
kubectl apply -f be\src\MentorPlatform.Gateway\k8s\pdb.yaml
kubectl apply -f be\src\MentorPlatform.Gateway\k8s\ingress.yaml
Write-Host "✓ API Gateway deployed" -ForegroundColor Green
Write-Host ""

# Wait for gateway to be ready
Write-Host "Waiting for API Gateway to be ready..." -ForegroundColor Blue
$rolloutStatus = kubectl rollout status deployment/mentorplatform-gateway --timeout=300s 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Gateway deployment failed. Showing diagnostics:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pod Status:" -ForegroundColor Yellow
    kubectl get pods -l app=mentorplatform-gateway
    Write-Host ""
    Write-Host "Pod Events:" -ForegroundColor Yellow
    kubectl describe pods -l app=mentorplatform-gateway | Select-String -Pattern "Events" -Context 0,10
    Write-Host ""
    Write-Host "Pod Logs:" -ForegroundColor Yellow
    kubectl logs -l app=mentorplatform-gateway --tail=50 --all-containers=true
    exit 1
}
Write-Host "✓ API Gateway is ready" -ForegroundColor Green
Write-Host ""

# Deploy Frontend
Write-Host "Deploying Frontend..." -ForegroundColor Yellow
kubectl apply -f fe\k8s\configmap.yaml
kubectl apply -f fe\k8s\deployment.yaml
kubectl apply -f fe\k8s\service.yaml
kubectl apply -f fe\k8s\ingress.yaml
Write-Host "✓ Frontend deployed" -ForegroundColor Green
Write-Host ""

# Wait for frontend to be ready
Write-Host "Waiting for Frontend to be ready..." -ForegroundColor Blue
kubectl rollout status deployment/mentorplatform-frontend --timeout=300s
Write-Host "✓ Frontend is ready" -ForegroundColor Green
Write-Host ""

# Get Minikube IP
$MINIKUBE_IP = minikube ip

# Summary
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment Status:" -ForegroundColor Blue
Write-Host "-------------------"
kubectl get deployments
Write-Host ""
Write-Host "Pods:" -ForegroundColor Blue
Write-Host "------"
kubectl get pods
Write-Host ""
Write-Host "Services:" -ForegroundColor Blue
Write-Host "---------"
kubectl get services
Write-Host ""
Write-Host "HPA Status:" -ForegroundColor Blue
Write-Host "-----------"
kubectl get hpa
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Access URLs:" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Gateway:" -ForegroundColor Green
Write-Host "  NodePort: http://$MINIKUBE_IP:30000"
Write-Host "  Health:   http://$MINIKUBE_IP:30000/health"
Write-Host "  Metrics:  http://$MINIKUBE_IP:30000/metrics"
Write-Host ""
Write-Host "Backend API (Direct):" -ForegroundColor Green
Write-Host "  NodePort: http://$MINIKUBE_IP:30080"
Write-Host "  Health:   http://$MINIKUBE_IP:30080/health"
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Green
Write-Host "  NodePort: http://$MINIKUBE_IP:30001"
Write-Host ""
Write-Host "RabbitMQ Management UI:" -ForegroundColor Green
Write-Host "  URL:      http://$MINIKUBE_IP:31672"
Write-Host "  Username: guest"
Write-Host "  Password: guest"
Write-Host ""
Write-Host "RabbitMQ AMQP:" -ForegroundColor Green
Write-Host "  Host:     rabbitmq (internal)"
Write-Host "  Port:     5672"
Write-Host "  VHost:    /"
Write-Host ""
Write-Host "To use Ingress, add to C:\Windows\System32\drivers\etc\hosts:" -ForegroundColor Yellow
Write-Host "  $MINIKUBE_IP api.mentorplatform.local"
Write-Host "  $MINIKUBE_IP mentorplatform.local"
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Quick Tests:" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Test Gateway Health:"
Write-Host "curl http://$MINIKUBE_IP:30000/health"
Write-Host ""
Write-Host "# Test API through Gateway:"
Write-Host "curl http://$MINIKUBE_IP:30000/api/health"
Write-Host ""
Write-Host "# View Gateway Metrics:"
Write-Host "curl http://$MINIKUBE_IP:30000/metrics"
Write-Host ""
Write-Host "# Monitor Gateway Logs:"
Write-Host "kubectl logs -f deployment/mentorplatform-gateway"
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
