#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}MentorPlatform Minikube Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
IMAGE_NAME="mentorplatform-api"
IMAGE_TAG="latest"
NAMESPACE="default"

# Navigate to the solution directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

echo -e "\n${YELLOW}Step 1: Configuring Docker to use Minikube's Docker daemon...${NC}"
eval $(minikube docker-env)

echo -e "\n${YELLOW}Step 2: Building Docker image inside Minikube...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -f Dockerfile ../

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 3: Applying Kubernetes configurations...${NC}"

# Apply database first
echo -e "${YELLOW}Deploying SQL Server database...${NC}"
kubectl apply -f k8s/database.yaml -n ${NAMESPACE}

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready (this may take a few minutes)...${NC}"
kubectl wait --for=condition=ready pod -l app=mssql -n ${NAMESPACE} --timeout=300s || echo "Warning: Database might still be starting..."

# Apply ConfigMap
echo -e "${YELLOW}Applying ConfigMap...${NC}"
kubectl apply -f k8s/configmap.yaml -n ${NAMESPACE}

# Apply Secret
echo -e "${YELLOW}Applying Secret...${NC}"
kubectl apply -f k8s/secret.yaml -n ${NAMESPACE}

# Apply Deployment
echo -e "${YELLOW}Applying Deployment...${NC}"
kubectl apply -f k8s/deployment.yaml -n ${NAMESPACE}

# Apply Service
echo -e "${YELLOW}Applying Service...${NC}"
kubectl apply -f k8s/service.yaml -n ${NAMESPACE}

echo -e "\n${YELLOW}Step 4: Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/mentorplatform-api -n ${NAMESPACE} --timeout=300s

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful${NC}"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    echo -e "${YELLOW}Checking pod status...${NC}"
    kubectl get pods -l app=mentorplatform-api -n ${NAMESPACE}
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

# Get Minikube service URL
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Access your application:${NC}"
echo -e "${GREEN}========================================${NC}"

# Get the service URL from Minikube
echo -e "${YELLOW}Getting Minikube service URL...${NC}"
minikube service mentorplatform-api-service --url -n ${NAMESPACE} &

# Also show NodePort
NODE_PORT=$(kubectl get svc mentorplatform-api-service -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].nodePort}')
MINIKUBE_IP=$(minikube ip)

echo -e "\n${YELLOW}Access URLs:${NC}"
echo -e "NodePort URL: ${GREEN}http://${MINIKUBE_IP}:${NODE_PORT}${NC}"
echo -e "Health Check: ${GREEN}http://${MINIKUBE_IP}:${NODE_PORT}/health${NC}"
echo -e "Swagger UI: ${GREEN}http://${MINIKUBE_IP}:${NODE_PORT}/swagger${NC}"

echo -e "\n${YELLOW}Or use port forwarding:${NC}"
echo -e "Run: ${GREEN}kubectl port-forward svc/mentorplatform-api-service 8080:80 -n ${NAMESPACE}${NC}"
echo -e "Then access: ${GREEN}http://localhost:8080${NC}"

# Check logs
echo -e "\n${YELLOW}Recent logs:${NC}"
POD_NAME=$(kubectl get pods -l app=mentorplatform-api -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ ! -z "$POD_NAME" ]; then
    kubectl logs ${POD_NAME} -n ${NAMESPACE} --tail=20 || true
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Useful Commands:${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "View logs: ${YELLOW}kubectl logs -f deployment/mentorplatform-api -n ${NAMESPACE}${NC}"
echo -e "View pods: ${YELLOW}kubectl get pods -n ${NAMESPACE}${NC}"
echo -e "Port forward: ${YELLOW}kubectl port-forward svc/mentorplatform-api-service 8080:80${NC}"
echo -e "Minikube dashboard: ${YELLOW}minikube dashboard${NC}"
echo -e "Delete deployment: ${YELLOW}kubectl delete -f k8s/ -n ${NAMESPACE}${NC}"
