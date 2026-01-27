#!/bin/bash

# Complete deployment script for MentorPlatform with API Gateway
set -e

echo "=================================================="
echo "  MentorPlatform Complete Deployment with Gateway"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
command -v minikube >/dev/null 2>&1 || { echo -e "${RED}minikube is required but not installed.${NC}" >&2; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}kubectl is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}docker is required but not installed.${NC}" >&2; exit 1; }
echo -e "${GREEN}✓ All prerequisites found${NC}"
echo ""

# Start Minikube if not running
if ! minikube status >/dev/null 2>&1; then
    echo -e "${YELLOW}Starting Minikube...${NC}"
    minikube start --cpus=4 --memory=8192
else
    echo -e "${GREEN}✓ Minikube is already running${NC}"
fi
echo ""

# Configure Docker to use Minikube's Docker daemon
echo -e "${BLUE}Configuring Docker environment...${NC}"
eval $(minikube docker-env)
echo -e "${GREEN}✓ Docker configured${NC}"
echo ""

# Build Backend API
echo -e "${YELLOW}Building Backend API Docker image...${NC}"
cd be/src
docker build -t mentorplatform-api:latest -f MentorPlatform.API/Dockerfile .
echo -e "${GREEN}✓ Backend API image built${NC}"
echo ""

# Build API Gateway
echo -e "${YELLOW}Building API Gateway Docker image...${NC}"
docker build -t mentorplatform-gateway:latest -f MentorPlatform.Gateway/Dockerfile .
echo -e "${GREEN}✓ API Gateway image built${NC}"
echo ""

# Build Frontend
echo -e "${YELLOW}Building Frontend Docker image...${NC}"
cd ../../fe
docker build -t mentorplatform-fe:latest .
echo -e "${GREEN}✓ Frontend image built${NC}"
echo ""

cd ..

# Deploy Backend API
echo -e "${YELLOW}Deploying Backend API...${NC}"
kubectl apply -f be/src/MentorPlatform.API/k8s/configmap.yaml
kubectl apply -f be/src/MentorPlatform.API/k8s/secret.yaml
kubectl apply -f be/src/MentorPlatform.API/k8s/deployment.yaml
kubectl apply -f be/src/MentorPlatform.API/k8s/service.yaml
echo -e "${GREEN}✓ Backend API deployed${NC}"
echo ""

# Wait for backend to be ready
echo -e "${BLUE}Waiting for Backend API to be ready...${NC}"
kubectl rollout status deployment/mentorplatform-api --timeout=300s
echo -e "${GREEN}✓ Backend API is ready${NC}"
echo ""

# Deploy API Gateway
echo -e "${YELLOW}Deploying API Gateway...${NC}"
kubectl apply -f be/src/MentorPlatform.Gateway/k8s/configmap.yaml
kubectl apply -f be/src/MentorPlatform.Gateway/k8s/deployment.yaml
kubectl apply -f be/src/MentorPlatform.Gateway/k8s/service.yaml
kubectl apply -f be/src/MentorPlatform.Gateway/k8s/hpa.yaml
kubectl apply -f be/src/MentorPlatform.Gateway/k8s/pdb.yaml
kubectl apply -f be/src/MentorPlatform.Gateway/k8s/ingress.yaml
echo -e "${GREEN}✓ API Gateway deployed${NC}"
echo ""

# Wait for gateway to be ready
echo -e "${BLUE}Waiting for API Gateway to be ready...${NC}"
if ! kubectl rollout status deployment/mentorplatform-gateway --timeout=300s; then
    echo -e "${RED}✗ Gateway deployment failed. Showing diagnostics:${NC}"
    echo ""
    echo -e "${YELLOW}Pod Status:${NC}"
    kubectl get pods -l app=mentorplatform-gateway
    echo ""
    echo -e "${YELLOW}Pod Events:${NC}"
    kubectl describe pods -l app=mentorplatform-gateway | grep -A 10 Events
    echo ""
    echo -e "${YELLOW}Pod Logs:${NC}"
    kubectl logs -l app=mentorplatform-gateway --tail=50 --all-containers=true
    exit 1
fi
echo -e "${GREEN}✓ API Gateway is ready${NC}"
echo ""

# Deploy Frontend
echo -e "${YELLOW}Deploying Frontend...${NC}"
kubectl apply -f fe/k8s/configmap.yaml
kubectl apply -f fe/k8s/deployment.yaml
kubectl apply -f fe/k8s/service.yaml
kubectl apply -f fe/k8s/ingress.yaml
echo -e "${GREEN}✓ Frontend deployed${NC}"
echo ""

# Wait for frontend to be ready
echo -e "${BLUE}Waiting for Frontend to be ready...${NC}"
kubectl rollout status deployment/mentorplatform-frontend --timeout=300s
echo -e "${GREEN}✓ Frontend is ready${NC}"
echo ""

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# Summary
echo ""
echo "=================================================="
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}Deployment Status:${NC}"
echo "-------------------"
kubectl get deployments
echo ""
echo -e "${BLUE}Pods:${NC}"
echo "------"
kubectl get pods
echo ""
echo -e "${BLUE}Services:${NC}"
echo "---------"
kubectl get services
echo ""
echo -e "${BLUE}HPA Status:${NC}"
echo "-----------"
kubectl get hpa
echo ""
echo "=================================================="
echo -e "${BLUE}Access URLs:${NC}"
echo "=================================================="
echo ""
echo -e "${GREEN}API Gateway:${NC}"
echo "  NodePort: http://${MINIKUBE_IP}:30000"
echo "  Health:   http://${MINIKUBE_IP}:30000/health"
echo "  Metrics:  http://${MINIKUBE_IP}:30000/metrics"
echo ""
echo -e "${GREEN}Backend API (Direct):${NC}"
echo "  NodePort: http://${MINIKUBE_IP}:30080"
echo "  Health:   http://${MINIKUBE_IP}:30080/health"
echo ""
echo -e "${GREEN}Frontend:${NC}"
echo "  NodePort: http://${MINIKUBE_IP}:30001"
echo ""
echo -e "${YELLOW}To use Ingress, add to /etc/hosts:${NC}"
echo "  ${MINIKUBE_IP} api.mentorplatform.local"
echo "  ${MINIKUBE_IP} mentorplatform.local"
echo ""
echo "=================================================="
echo -e "${GREEN}Quick Tests:${NC}"
echo "=================================================="
echo ""
echo "# Test Gateway Health:"
echo "curl http://${MINIKUBE_IP}:30000/health"
echo ""
echo "# Test API through Gateway:"
echo "curl http://${MINIKUBE_IP}:30000/api/health"
echo ""
echo "# View Gateway Metrics:"
echo "curl http://${MINIKUBE_IP}:30000/metrics"
echo ""
echo "# Monitor Gateway Logs:"
echo "kubectl logs -f deployment/mentorplatform-gateway"
echo ""
echo "=================================================="
