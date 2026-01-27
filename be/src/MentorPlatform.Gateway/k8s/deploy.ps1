# Deploy MentorPlatform Gateway to Minikube (PowerShell)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deploying MentorPlatform Gateway to Minikube" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Build the Docker image inside Minikube
Write-Host "Building Gateway Docker image..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker build -t mentorplatform-gateway:latest -f Dockerfile ..

# Apply Kubernetes manifests
Write-Host "Applying Kubernetes manifests..." -ForegroundColor Yellow
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml
kubectl apply -f ingress.yaml

# Wait for deployment to be ready
Write-Host "Waiting for deployment to be ready..." -ForegroundColor Yellow
kubectl rollout status deployment/mentorplatform-gateway -n default --timeout=300s

# Show deployment status
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Gateway Deployment Status:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
kubectl get deployments -n default -l app=mentorplatform-gateway
kubectl get pods -n default -l app=mentorplatform-gateway
kubectl get services -n default -l app=mentorplatform-gateway
kubectl get hpa -n default -l app=mentorplatform-gateway
kubectl get pdb -n default -l app=mentorplatform-gateway

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Gateway URLs:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
$minikubeIp = minikube ip
Write-Host "NodePort: http://$minikubeIp:30000" -ForegroundColor Green
Write-Host "Ingress (add to hosts file): http://api.mentorplatform.local" -ForegroundColor Green
Write-Host ""
Write-Host "To access via ingress, add this line to C:\Windows\System32\drivers\etc\hosts:" -ForegroundColor Yellow
Write-Host "$minikubeIp api.mentorplatform.local" -ForegroundColor Yellow
Write-Host ""
Write-Host "Health check: http://$minikubeIp:30000/health" -ForegroundColor Green
Write-Host "Metrics: http://$minikubeIp:30000/metrics" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
