#!/bin/bash

# Port Forward All MentorPlatform Services
# This script sets up port forwarding for all services in the mentorplatform namespace

set -e

echo "=================================================="
echo "  MentorPlatform Port Forwarding Setup"
echo "=================================================="
echo ""

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up port forwarding for all services...${NC}"
echo ""

# Function to start port forward in background
start_port_forward() {
    local service=$1
    local namespace=$2
    local local_port=$3
    local service_port=$4
    
    echo -e "${YELLOW}Port forwarding ${service}...${NC}"
    kubectl port-forward -n ${namespace} svc/${service} ${local_port}:${service_port} > /dev/null 2>&1 &
    local pid=$!
    echo -e "${GREEN}✓ ${service} forwarded to localhost:${local_port} (PID: ${pid})${NC}"
}

# Frontend
start_port_forward "mentorplatform-frontend-service" "mentorplatform" "3000" "80"

# Backend API
start_port_forward "mentorplatform-api-service" "mentorplatform" "8080" "80"

# Gateway
start_port_forward "mentorplatform-gateway-service" "mentorplatform" "8000" "80"

# RabbitMQ Management
start_port_forward "rabbitmq-management" "mentorplatform" "15672" "15672"

# Redis
start_port_forward "redis" "mentorplatform" "6379" "6379"

# MSSQL
start_port_forward "mssql-service" "mentorplatform" "1433" "1433"

echo ""
echo "=================================================="
echo "  Port Forwarding Setup Complete"
echo "=================================================="
echo ""
echo -e "${GREEN}Access your services at:${NC}"
echo -e "  ${BLUE}Frontend:${NC}           http://localhost:3000"
echo -e "  ${BLUE}Backend API:${NC}        http://localhost:8080"
echo -e "  ${BLUE}Gateway:${NC}            http://localhost:8000"
echo -e "  ${BLUE}RabbitMQ Management:${NC} http://localhost:15672"
echo -e "  ${BLUE}Redis:${NC}              localhost:6379"
echo -e "  ${BLUE}Database (MSSQL):${NC}   localhost:1433"
echo ""
echo -e "${YELLOW}Or use Minikube IPs:${NC}"
echo -e "  ${BLUE}Frontend:${NC}           http://192.168.49.2:30081"
echo -e "  ${BLUE}Backend API:${NC}        http://192.168.49.2:32080"
echo -e "  ${BLUE}Gateway:${NC}            http://192.168.49.2:30000"
echo -e "  ${BLUE}RabbitMQ Management:${NC} http://192.168.49.2:31672"
echo ""
echo -e "${YELLOW}To stop port forwarding, run:${NC}"
echo "  killall kubectl"
echo ""
