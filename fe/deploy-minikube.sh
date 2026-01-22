#!/bin/bash

# Deploy MentorPlatform Frontend to Minikube
# This script builds the Docker image and deploys to Minikube

set -e

echo "======================================"
echo "MentorPlatform Frontend Deployment"
echo "======================================"

# Check if minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "Error: Minikube is not running. Please start minikube first."
    echo "Run: minikube start"
    exit 1
fi

echo "✓ Minikube is running"

# Switch to minikube's docker environment
echo ""
echo "Configuring Docker to use Minikube's daemon..."
eval $(minikube docker-env)
echo "✓ Docker environment configured"

# Build the Docker image
echo ""
echo "Building Docker image..."
docker build -t mentorplatform-frontend:latest \
    --build-arg VITE_API_URL_ROOT=http://mentorplatform-api-service:8080 \
    -f Dockerfile .

if [ $? -eq 0 ]; then
    echo "✓ Docker image built successfully"
else
    echo "✗ Failed to build Docker image"
    exit 1
fi

# Apply Kubernetes manifests
echo ""
echo "Applying Kubernetes manifests..."

# Apply ConfigMap
echo "  - Applying ConfigMap..."
kubectl apply -f k8s/configmap.yaml

# Apply Deployment
echo "  - Applying Deployment..."
kubectl apply -f k8s/deployment.yaml

# Apply Service
echo "  - Applying Service..."
kubectl apply -f k8s/service.yaml

echo "✓ Kubernetes manifests applied"

# Wait for deployment to be ready
echo ""
echo "Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mentorplatform-frontend

echo ""
echo "======================================"
echo "Deployment completed successfully!"
echo "======================================"

# Get the service URL
echo ""
echo "Getting service URL..."
minikube service mentorplatform-frontend-service --url

echo ""
echo "You can access the application using:"
echo "  minikube service mentorplatform-frontend-service"
echo ""
echo "To check the status:"
echo "  kubectl get pods -l app=mentorplatform-frontend"
echo "  kubectl get svc mentorplatform-frontend-service"
echo ""
echo "To view logs:"
echo "  kubectl logs -l app=mentorplatform-frontend --tail=100 -f"
