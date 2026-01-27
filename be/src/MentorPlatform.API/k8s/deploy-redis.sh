#!/bin/bash
# Quick script to deploy Redis and test connectivity

set -e

NAMESPACE="mentorplatform"

echo "====================================="
echo "Deploying Redis Cache"
echo "====================================="

# Create namespace
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy Redis
kubectl apply -f redis.yaml

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
kubectl wait --for=condition=available --timeout=180s deployment/redis -n $NAMESPACE

echo ""
echo "✓ Redis deployed successfully!"
echo ""

# Test Redis
echo "Testing Redis connection..."
kubectl run redis-test --rm -it --image=redis:7-alpine -n $NAMESPACE -- redis-cli -h redis ping

echo ""
echo "Redis service info:"
kubectl get svc redis -n $NAMESPACE
echo ""
echo "Redis connection string: redis:6379"
