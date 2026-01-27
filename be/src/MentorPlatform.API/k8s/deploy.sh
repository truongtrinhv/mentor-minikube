#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}MentorPlatform Kubernetes Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
IMAGE_NAME="mentorplatform-api"
IMAGE_TAG="latest"
NAMESPACE="mentorplatform"

# Navigate to the solution directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

echo -e "\n${YELLOW}Step 1: Creating namespace...${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

echo -e "\n${YELLOW}Step 2: Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -f Dockerfile ../

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 3: Applying Kubernetes configurations...${NC}"

# Deploy Redis cache first
echo -e "${YELLOW}Deploying Redis cache...${NC}"
kubectl apply -f k8s/redis.yaml -n ${NAMESPACE}

# Wait for Redis to be ready
echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
kubectl wait --for=condition=available deployment/redis -n ${NAMESPACE} --timeout=180s || true

# Apply database
echo -e "${YELLOW}Deploying SQL Server database...${NC}"
kubectl apply -f k8s/database.yaml -n ${NAMESPACE}

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=mssql -n ${NAMESPACE} --timeout=180s || true

# Apply ConfigMap
echo -e "${YELLOW}Applying ConfigMap...${NC}"
kubectl apply -f k8s/configmap.yaml -n ${NAMESPACE}

# Apply Secret
echo -e "${YELLOW}Applying Secret...${NC}"
kubectl apply -f k8s/secret.yaml -n ${NAMESPACE}

# Apply Deployment4
echo -e "${YELLOW}Applying Deployment...${NC}"
kubectl apply -f k8s/deployment.yaml -n ${NAMESPACE}

# Apply Service
echo -e "${YELLOW}Applying Service...${NC}"
kubectl apply -f k8s/service.yaml -n ${NAMESPACE}

echo -e "\n${YELLOW}Step 3: Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/mentorplatform-api -n ${NAMESPACE} --timeout=300s

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful${NC}"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Information${NC}"
echo -e "${GREEN}========================================${NC}"

# Get pod status
echo -e "\n${YELLOW}Pods:${NC}"
kubectl get pods -l app=mentorplatform-api -n ${NAMESPACE}

# Get service information
echo -e "\n${YELLOW}Services:${NC}"
kubectl get svc -l app=mentorplatform-api -n ${NAMESPACE}

# Get NodePort
NODE_PORT=$(kubectl get svc mentorplatform-api-service -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].nodePort}')
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Access your application:${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}NodePort URL:${NC} http://localhost:${NODE_PORT}"
echo -e "${YELLOW}Internal URL:${NC} http://mentorplatform-api-service.${NAMESPACE}.svc.cluster.local"

# Check logs
echo -e "\n${YELLOW}Recent logs:${NC}"
POD_NAME=$(kubectl get pods -l app=mentorplatform-api -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}')
kubectl logs ${POD_NAME} -n ${NAMESPACE} --tail=20 || true

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Useful Commands:${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "View logs: ${YELLOW}kubectl logs -f deployment/mentorplatform-api -n ${NAMESPACE}${NC}"
echo -e "View pods: ${YELLOW}kubectl get pods -n ${NAMESPACE}${NC}"
echo -e "Describe pod: ${YELLOW}kubectl describe pod <pod-name> -n ${NAMESPACE}${NC}"
echo -e "Restart deployment: ${YELLOW}kubectl rollout restart deployment/mentorplatform-api -n ${NAMESPACE}${NC}"
echo -e "Delete deployment: ${YELLOW}kubectl delete -f k8s/ -n ${NAMESPACE}${NC}"
