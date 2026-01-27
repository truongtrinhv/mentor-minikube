#!/bin/bash

# Deploy MentorPlatform Gateway to Minikube
set -e

echo "=========================================="
echo "Deploying MentorPlatform Gateway to Minikube"
echo "=========================================="

# Build the Docker image inside Minikube
echo "Building Gateway Docker image..."
eval $(minikube docker-env)
docker build -t mentorplatform-gateway:latest -f Dockerfile ..

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml
kubectl apply -f ingress.yaml

# Wait for deployment to be ready
echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/mentorplatform-gateway -n default --timeout=300s

# Show deployment status
echo ""
echo "=========================================="
echo "Gateway Deployment Status:"
echo "=========================================="
kubectl get deployments -n default -l app=mentorplatform-gateway
kubectl get pods -n default -l app=mentorplatform-gateway
kubectl get services -n default -l app=mentorplatform-gateway
kubectl get hpa -n default -l app=mentorplatform-gateway
kubectl get pdb -n default -l app=mentorplatform-gateway

echo ""
echo "=========================================="
echo "Gateway URLs:"
echo "=========================================="
echo "NodePort: http://$(minikube ip):30000"
echo "Ingress (add to /etc/hosts): http://api.mentorplatform.local"
echo ""
echo "To access via ingress, add this line to /etc/hosts:"
echo "$(minikube ip) api.mentorplatform.local"
echo ""
echo "Health check: http://$(minikube ip):30000/health"
echo "Metrics: http://$(minikube ip):30000/metrics"
echo "=========================================="
