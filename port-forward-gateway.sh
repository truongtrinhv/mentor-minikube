#!/bin/bash

# Port forward the API Gateway for local access

echo "Forwarding Gateway port 8080 to localhost:5000..."
echo ""
echo "Access URLs:"
echo "  Health:  http://localhost:5000/health"
echo "  Metrics: http://localhost:5000/metrics"
echo "  API:     http://localhost:5000/api/..."
echo ""
echo "Press Ctrl+C to stop port forwarding"
echo ""

kubectl port-forward deployment/mentorplatform-gateway 5000:8080
