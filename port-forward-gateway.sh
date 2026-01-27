#!/bin/bash

# Port forward Gateway, Backend API, and Frontend for local access

echo "==========================================="
echo "MentorPlatform Port Forwarding"
echo "==========================================="
echo ""
echo "Starting port forwarding for:"
echo "  - Gateway (default namespace)"
echo "  - Backend API (mentorplatform namespace)"
echo "  - Frontend (default namespace)"
echo ""

# Kill existing port-forwards
echo "Stopping any existing port-forwards..."
pkill -f "kubectl port-forward" 2>/dev/null
sleep 2

# Start port-forwards in background
echo "Starting Gateway port-forward (localhost:30000)..."
kubectl port-forward -n default svc/mentorplatform-gateway-nodeport 30000:80 > /dev/null 2>&1 &
GATEWAY_PID=$!

echo "Starting Backend API port-forward (localhost:32080)..."
kubectl port-forward -n mentorplatform svc/mentorplatform-api-service 32080:80 > /dev/null 2>&1 &
API_PID=$!

echo "Starting Frontend port-forward (localhost:30081)..."
kubectl port-forward -n default svc/mentorplatform-frontend-service 30081:80 > /dev/null 2>&1 &
FRONTEND_PID=$!

sleep 2

echo ""
echo "==========================================="
echo "Port Forwarding Active"
echo "==========================================="
echo ""
echo "Access URLs:"
echo "  Gateway:  http://localhost:30000"
echo "    - Health: http://localhost:30000/health"
echo "    - API:    http://localhost:30000/api/..."
echo ""
echo "  Backend:  http://localhost:32080"
echo "    - Health: http://localhost:32080/health"
echo "    - Swagger: http://localhost:32080/swagger"
echo ""
echo "  Frontend: http://localhost:30081"
echo ""
echo "Process IDs:"
echo "  Gateway:  $GATEWAY_PID"
echo "  Backend:  $API_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all port forwarding"
echo "==========================================="
echo ""

# Trap Ctrl+C to cleanup
trap "echo ''; echo 'Stopping all port-forwards...'; kill $GATEWAY_PID $API_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Wait for all processes
wait
