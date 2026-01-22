@echo off
REM Deploy MentorPlatform Frontend to Minikube (Windows)
REM This script builds the Docker image and deploys to Minikube

echo ======================================
echo MentorPlatform Frontend Deployment
echo ======================================

REM Check if minikube is running
minikube status >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Minikube is not running. Please start minikube first.
    echo Run: minikube start
    exit /b 1
)

echo [OK] Minikube is running

REM Switch to minikube's docker environment
echo.
echo Configuring Docker to use Minikube's daemon...
@echo on
@for /f "tokens=*" %%i in ('minikube -p minikube docker-env --shell cmd') do @%%i
@echo off
echo [OK] Docker environment configured

REM Build the Docker image
echo.
echo Building Docker image...
docker build -t mentorplatform-frontend:latest --build-arg VITE_API_URL_ROOT=http://mentorplatform-api-service:8080 -f Dockerfile .

if %errorlevel% neq 0 (
    echo [FAILED] Failed to build Docker image
    exit /b 1
)

echo [OK] Docker image built successfully

REM Apply Kubernetes manifests
echo.
echo Applying Kubernetes manifests...

echo   - Applying ConfigMap...
kubectl apply -f k8s/configmap.yaml

echo   - Applying Deployment...
kubectl apply -f k8s/deployment.yaml

echo   - Applying Service...
kubectl apply -f k8s/service.yaml

echo [OK] Kubernetes manifests applied

REM Wait for deployment to be ready
echo.
echo Waiting for deployment to be ready...
kubectl wait --for=condition=available --timeout=300s deployment/mentorplatform-frontend

echo.
echo ======================================
echo Deployment completed successfully!
echo ======================================

REM Get the service URL
echo.
echo Getting service URL...
minikube service mentorplatform-frontend-service --url

echo.
echo You can access the application using:
echo   minikube service mentorplatform-frontend-service
echo.
echo To check the status:
echo   kubectl get pods -l app=mentorplatform-frontend
echo   kubectl get svc mentorplatform-frontend-service
echo.
echo To view logs:
echo   kubectl logs -l app=mentorplatform-frontend --tail=100 -f
