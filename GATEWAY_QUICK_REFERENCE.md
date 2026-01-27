# API Gateway Quick Reference

## Common Commands

### Deployment
```bash
# Deploy gateway
cd be/src/MentorPlatform.Gateway/k8s
./deploy.sh  # or deploy.ps1 on Windows

# Deploy entire platform
./deploy-all.sh  # from project root
```

### Status Checks
```bash
# Quick status
kubectl get pods -l app=mentorplatform-gateway
kubectl get hpa mentorplatform-gateway-hpa

# Detailed status
kubectl describe deployment mentorplatform-gateway
kubectl describe hpa mentorplatform-gateway-hpa
kubectl describe pdb mentorplatform-gateway-pdb

# View events
kubectl get events --sort-by='.lastTimestamp' | grep gateway
```

### Logs
```bash
# Live logs
kubectl logs -f deployment/mentorplatform-gateway

# Last 100 lines
kubectl logs deployment/mentorplatform-gateway --tail=100

# All replicas
kubectl logs -l app=mentorplatform-gateway --all-containers=true

# Filter for errors
kubectl logs deployment/mentorplatform-gateway | grep -i error

# Circuit breaker events
kubectl logs deployment/mentorplatform-gateway | grep "Circuit breaker"
```

### Health & Monitoring
```bash
# Health check
curl http://$(minikube ip):30000/health

# Prometheus metrics
curl http://$(minikube ip):30000/metrics

# Test API route
curl http://$(minikube ip):30000/api/health

# Check endpoints
kubectl get endpoints mentorplatform-gateway-service
```

### Scaling
```bash
# Manual scale
kubectl scale deployment mentorplatform-gateway --replicas=5

# Check HPA status
kubectl get hpa mentorplatform-gateway-hpa

# Watch HPA
kubectl get hpa -w

# Describe HPA (see events)
kubectl describe hpa mentorplatform-gateway-hpa
```

### Load Testing
```bash
# Install hey (Linux)
wget https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
chmod +x hey_linux_amd64
sudo mv hey_linux_amd64 /usr/local/bin/hey

# Install hey (Mac)
brew install hey

# Generate load
hey -z 60s -c 50 -q 10 http://$(minikube ip):30000/api/health

# Test rate limiting
for i in {1..150}; do curl -s -w "%{http_code}\n" http://$(minikube ip):30000/api/health; done
```

### Updates & Rollbacks
```bash
# Update image
kubectl set image deployment/mentorplatform-gateway gateway=mentorplatform-gateway:v2

# Check rollout status
kubectl rollout status deployment/mentorplatform-gateway

# Pause rollout
kubectl rollout pause deployment/mentorplatform-gateway

# Resume rollout
kubectl rollout resume deployment/mentorplatform-gateway

# View history
kubectl rollout history deployment/mentorplatform-gateway

# Rollback
kubectl rollout undo deployment/mentorplatform-gateway

# Rollback to specific revision
kubectl rollout undo deployment/mentorplatform-gateway --to-revision=2

# Restart deployment
kubectl rollout restart deployment/mentorplatform-gateway
```

### Configuration
```bash
# View ConfigMap
kubectl get configmap gateway-config -o yaml

# Edit ConfigMap
kubectl edit configmap gateway-config

# Restart to apply config changes
kubectl rollout restart deployment/mentorplatform-gateway

# View current appsettings (from pod)
kubectl exec -it deployment/mentorplatform-gateway -- cat /app/appsettings.json
```

### Troubleshooting
```bash
# Get shell in pod
kubectl exec -it deployment/mentorplatform-gateway -- /bin/bash

# Check DNS resolution
kubectl exec -it deployment/mentorplatform-gateway -- nslookup mentorplatform-api-service

# Test backend from gateway pod
kubectl exec -it deployment/mentorplatform-gateway -- curl http://mentorplatform-api-service/health

# Check pod resource usage
kubectl top pods -l app=mentorplatform-gateway

# Check node resources
kubectl top nodes

# Describe pod (see events, status)
kubectl describe pod -l app=mentorplatform-gateway
```

### Cleanup
```bash
# Delete gateway deployment
kubectl delete deployment mentorplatform-gateway

# Delete all gateway resources
kubectl delete -f be/src/MentorPlatform.Gateway/k8s/

# Delete specific resources
kubectl delete hpa mentorplatform-gateway-hpa
kubectl delete pdb mentorplatform-gateway-pdb
kubectl delete service mentorplatform-gateway-service
kubectl delete configmap gateway-config
```

## Common Issues

### Issue: Pods not starting
```bash
# Check pod status
kubectl describe pod -l app=mentorplatform-gateway

# Common causes:
# - Image pull errors
# - Resource constraints
# - Invalid configuration
```

### Issue: High latency
```bash
# Check backend health
kubectl get pods -l app=mentorplatform-api

# Check HPA status (may need to scale)
kubectl get hpa mentorplatform-gateway-hpa

# Check resource usage
kubectl top pods -l app=mentorplatform-gateway

# Review circuit breaker logs
kubectl logs deployment/mentorplatform-gateway | grep "Circuit breaker"
```

### Issue: 429 Too Many Requests
```bash
# Check rate limiter logs
kubectl logs deployment/mentorplatform-gateway | grep "Too many requests"

# Increase rate limit in appsettings.json
# Then update ConfigMap and restart
```

### Issue: Circuit breaker keeps opening
```bash
# Check backend service endpoints
kubectl get endpoints mentorplatform-api-service

# Check backend pod health
kubectl get pods -l app=mentorplatform-api

# Review backend logs
kubectl logs deployment/mentorplatform-api --tail=50
```

## Metrics to Monitor

### Key Prometheus Metrics
- `http_requests_total` - Total requests
- `http_request_duration_seconds` - Request latency
- `yarp_proxy_requests_total` - Proxied requests
- `yarp_proxy_current_requests` - Active requests
- `dotnet_gc_*` - Garbage collection metrics
- `process_cpu_seconds_total` - CPU usage

### Query Examples
```bash
# View all metrics
curl http://$(minikube ip):30000/metrics

# Filter for specific metric
curl http://$(minikube ip):30000/metrics | grep http_requests_total

# Filter for YARP metrics
curl http://$(minikube ip):30000/metrics | grep yarp_
```

## Access URLs

```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# Gateway endpoints
echo "Health:  http://$MINIKUBE_IP:30000/health"
echo "Metrics: http://$MINIKUBE_IP:30000/metrics"
echo "API:     http://$MINIKUBE_IP:30000/api/health"

# Backend direct
echo "Backend: http://$MINIKUBE_IP:30080/health"
```

## Configuration Files

- **Gateway Config**: `be/src/MentorPlatform.Gateway/appsettings.json`
- **Deployment**: `be/src/MentorPlatform.Gateway/k8s/deployment.yaml`
- **HPA**: `be/src/MentorPlatform.Gateway/k8s/hpa.yaml`
- **PDB**: `be/src/MentorPlatform.Gateway/k8s/pdb.yaml`
- **Service**: `be/src/MentorPlatform.Gateway/k8s/service.yaml`
- **Ingress**: `be/src/MentorPlatform.Gateway/k8s/ingress.yaml`

## Rate Limit Configuration

Current: 100 requests/minute per IP

To change, edit `appsettings.json`:
```json
"RateLimiting": {
  "FixedWindow": {
    "PermitLimit": 200,  // New limit
    "Window": "00:01:00"
  }
}
```

## Circuit Breaker Configuration

Current settings:
- Failure Threshold: 50%
- Sampling Duration: 30s
- Minimum Throughput: 10 requests
- Break Duration: 30s

To change, edit `appsettings.json`:
```json
"CircuitBreaker": {
  "FailureThreshold": 0.6,
  "SamplingDuration": "00:00:45",
  "MinimumThroughput": 15,
  "BreakDuration": "00:01:00"
}
```

## Auto-Scaling Configuration

Current HPA settings:
- Min Replicas: 3
- Max Replicas: 10
- CPU Target: 70%
- Memory Target: 80%

To change, edit `k8s/hpa.yaml` and apply:
```bash
kubectl apply -f be/src/MentorPlatform.Gateway/k8s/hpa.yaml
```

## Emergency Procedures

### Scale Up Immediately
```bash
kubectl scale deployment mentorplatform-gateway --replicas=10
```

### Disable Rate Limiting
```bash
# Edit deployment to use dev config (no rate limiting)
kubectl set env deployment/mentorplatform-gateway ASPNETCORE_ENVIRONMENT=Development
```

### Emergency Rollback
```bash
kubectl rollout undo deployment/mentorplatform-gateway
```

### Bypass Gateway (Emergency)
Use backend directly:
```bash
# Update frontend ConfigMap to point to backend service
# http://mentorplatform-api-service instead of gateway
```
