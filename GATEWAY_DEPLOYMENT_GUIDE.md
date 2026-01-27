# MentorPlatform - High Availability REST API Gateway with YARP

## Overview

This deployment guide covers the implementation of a high-availability REST API Gateway using YARP (Yet Another Reverse Proxy) for the MentorPlatform backend services.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React App)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│           Ingress Controller                │
│         (nginx-ingress)                     │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│     API Gateway (YARP) - 3-10 replicas      │
│  ┌─────────────────────────────────────┐   │
│  │ - Load Balancing                    │   │
│  │ - Rate Limiting (100 req/min)       │   │
│  │ - Circuit Breaker                   │   │
│  │ - Health Checks                     │   │
│  │ - Request/Response Transforms       │   │
│  │ - OpenTelemetry Metrics             │   │
│  └─────────────────────────────────────┘   │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│   Backend API Service - 2 replicas          │
│   (MentorPlatform.API)                      │
└─────────────────────────────────────────────┘
```

## Key Features

### High Availability
- ✅ **3 replicas minimum** - Ensures service availability
- ✅ **Auto-scaling (HPA)** - Scales 3-10 replicas based on CPU/Memory
- ✅ **Pod Anti-Affinity** - Distributes pods across nodes
- ✅ **Pod Disruption Budget** - Maintains minimum 2 pods during maintenance
- ✅ **Zero-downtime deployments** - Rolling updates with maxUnavailable: 0

### Resilience
- ✅ **Circuit Breaker** - Prevents cascading failures (Polly)
- ✅ **Rate Limiting** - 100 requests/minute per IP
- ✅ **Health Checks** - Active & passive monitoring
- ✅ **Retry Logic** - Automatic retries for transient failures
- ✅ **Graceful Shutdown** - 60s termination grace period

### Observability
- ✅ **Prometheus Metrics** - `/metrics` endpoint
- ✅ **OpenTelemetry** - Distributed tracing
- ✅ **Structured Logging** - Request/response logging
- ✅ **Health Endpoint** - `/health` for monitoring

### Security
- ✅ **Security Headers** - X-Frame-Options, CSP, HSTS
- ✅ **CORS Support** - Configurable cross-origin requests
- ✅ **Non-root Container** - Runs as UID 1000
- ✅ **Rate Limiting** - Protection against DDoS

## Prerequisites

- Kubernetes cluster (Minikube for local development)
- Docker
- kubectl CLI
- .NET 8.0 SDK

## Quick Start

### 1. Deploy Gateway to Minikube

**Linux/macOS:**
```bash
cd be/src/MentorPlatform.Gateway/k8s
chmod +x deploy.sh
./deploy.sh
```

**Windows (PowerShell):**
```powershell
cd be\src\MentorPlatform.Gateway\k8s
.\deploy.ps1
```

### 2. Verify Deployment

```bash
# Check gateway pods
kubectl get pods -l app=mentorplatform-gateway

# Check HPA status
kubectl get hpa mentorplatform-gateway-hpa

# Check services
kubectl get svc -l app=mentorplatform-gateway

# Test health endpoint
curl http://$(minikube ip):30000/health
```

### 3. Access the Gateway

**NodePort (Development):**
```bash
# Get Minikube IP
minikube ip

# Access gateway
curl http://<minikube-ip>:30000/health

# Test API route
curl http://<minikube-ip>:30000/api/health
```

**Ingress (Production-like):**
```bash
# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
<minikube-ip> api.mentorplatform.local

# Access via ingress
curl http://api.mentorplatform.local/health
curl http://api.mentorplatform.local/api/health
```

## Gateway Configuration

### Route Configuration

The gateway routes requests based on path patterns:

| Pattern | Backend | Description |
|---------|---------|-------------|
| `/api/*` | Backend API | Main API endpoints |
| `/health` | Backend API | Health check |
| `/hubs/*` | Backend API | SignalR WebSockets |
| `/swagger/*` | Backend API | API documentation |

### Load Balancing

- **Policy**: Round Robin
- **Session Affinity**: Disabled (stateless)
- **Health Checks**: Active every 30s, Passive enabled

### Rate Limiting

- **Strategy**: Fixed Window
- **Limit**: 100 requests per minute per IP
- **Queue**: 10 requests
- **Response**: HTTP 429 when exceeded

### Circuit Breaker

- **Failure Threshold**: 50%
- **Sampling Duration**: 30 seconds
- **Minimum Throughput**: 10 requests
- **Break Duration**: 30 seconds

## High Availability Configuration

### Horizontal Pod Autoscaler (HPA)

```yaml
minReplicas: 3
maxReplicas: 10
targetCPUUtilization: 70%
targetMemoryUtilization: 80%
```

**Scaling Behavior:**
- Scale Up: Max 4 pods or 100% increase every 30s
- Scale Down: Max 2 pods or 50% decrease every 60s (after 5min stabilization)

### Pod Disruption Budget (PDB)

```yaml
minAvailable: 2
```

Ensures at least 2 pods remain available during:
- Node maintenance
- Cluster upgrades
- Voluntary disruptions

### Resource Allocation

**Requests (Guaranteed):**
- CPU: 100m
- Memory: 128Mi

**Limits (Maximum):**
- CPU: 500m
- Memory: 512Mi

## Monitoring & Observability

### Prometheus Metrics

Access metrics endpoint:
```bash
curl http://<gateway-url>/metrics
```

**Key Metrics:**
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency
- `yarp_proxy_requests_total` - Proxied requests
- `yarp_proxy_current_requests` - Active requests
- `dotnet_*` - .NET runtime metrics

### Health Checks

```bash
# Gateway health
curl http://<gateway-url>/health

# View health check logs
kubectl logs -f deployment/mentorplatform-gateway | grep health
```

### Logs

```bash
# Stream logs
kubectl logs -f deployment/mentorplatform-gateway

# View specific pod logs
kubectl logs -f <pod-name>

# View logs from all replicas
kubectl logs -f -l app=mentorplatform-gateway --all-containers=true
```

## Testing High Availability

### 1. Test Auto-Scaling

Generate load to trigger HPA:
```bash
# Install hey (HTTP load generator)
# Linux: wget https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
# Mac: brew install hey

# Generate load
hey -z 60s -c 50 -q 10 http://$(minikube ip):30000/api/health

# Watch HPA scale up
kubectl get hpa mentorplatform-gateway-hpa -w
```

### 2. Test Pod Disruption Budget

```bash
# Try to drain a node (should maintain minAvailable)
kubectl drain <node-name> --ignore-daemonsets

# Check running pods
kubectl get pods -l app=mentorplatform-gateway
```

### 3. Test Circuit Breaker

```bash
# Stop backend API
kubectl scale deployment mentorplatform-api --replicas=0

# Send requests through gateway
for i in {1..20}; do
  curl http://$(minikube ip):30000/api/health
  sleep 1
done

# Check logs for circuit breaker events
kubectl logs deployment/mentorplatform-gateway | grep "Circuit breaker"
```

### 4. Test Rate Limiting

```bash
# Send 150 requests rapidly (exceeds 100/min limit)
for i in {1..150}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://$(minikube ip):30000/api/health
done

# Should see HTTP 429 responses after ~100 requests
```

### 5. Test Zero-Downtime Deployment

```bash
# Terminal 1: Generate continuous traffic
while true; do
  curl -s http://$(minikube ip):30000/health
  sleep 0.5
done

# Terminal 2: Update deployment
kubectl set image deployment/mentorplatform-gateway gateway=mentorplatform-gateway:v2

# Watch rollout (should see no downtime in Terminal 1)
kubectl rollout status deployment/mentorplatform-gateway
```

## Performance Tuning

### Connection Pooling

Configure in `appsettings.json`:
```json
"HttpClient": {
  "MaxConnectionsPerServer": 100,
  "ActivityTimeout": "00:02:00",
  "KeepAliveTimeout": "00:01:00"
}
```

### Request Timeout

```json
"HttpRequest": {
  "Timeout": "00:01:40",
  "Version": "2",
  "VersionPolicy": "RequestVersionOrLower"
}
```

### Increase Rate Limits

For higher traffic:
```json
"RateLimiting": {
  "FixedWindow": {
    "PermitLimit": 200,
    "Window": "00:01:00"
  }
}
```

## Troubleshooting

### Gateway pods not starting

```bash
# Check pod status
kubectl describe pod -l app=mentorplatform-gateway

# Check events
kubectl get events --sort-by='.lastTimestamp' | grep gateway

# Check logs
kubectl logs -l app=mentorplatform-gateway --tail=100
```

### High latency

```bash
# Check HPA status
kubectl get hpa

# Check resource usage
kubectl top pods -l app=mentorplatform-gateway

# Check backend health
kubectl get pods -l app=mentorplatform-api
```

### Rate limiting issues

```bash
# Check rate limiter logs
kubectl logs deployment/mentorplatform-gateway | grep "Too many requests"

# Increase rate limits in ConfigMap
kubectl edit configmap gateway-config
```

### Circuit breaker keeps opening

```bash
# Check backend service health
kubectl get endpoints mentorplatform-api-service

# Check backend logs
kubectl logs deployment/mentorplatform-api

# Adjust circuit breaker settings in appsettings.json
```

## Rollback

If issues occur after deployment:

```bash
# View rollout history
kubectl rollout history deployment/mentorplatform-gateway

# Rollback to previous version
kubectl rollout undo deployment/mentorplatform-gateway

# Rollback to specific revision
kubectl rollout undo deployment/mentorplatform-gateway --to-revision=2
```

## Clean Up

```bash
# Delete gateway resources
kubectl delete -f be/src/MentorPlatform.Gateway/k8s/

# Or delete individually
kubectl delete deployment mentorplatform-gateway
kubectl delete service mentorplatform-gateway-service
kubectl delete hpa mentorplatform-gateway-hpa
kubectl delete pdb mentorplatform-gateway-pdb
kubectl delete ingress mentorplatform-gateway-ingress
kubectl delete configmap gateway-config
```

## Production Checklist

Before deploying to production:

- [ ] Configure TLS/HTTPS in Ingress
- [ ] Set up cert-manager for SSL certificates
- [ ] Configure production rate limits
- [ ] Set up log aggregation (ELK, Grafana Loki)
- [ ] Configure Prometheus scraping
- [ ] Set up alerting rules
- [ ] Configure backup/restore for configurations
- [ ] Review and adjust resource limits
- [ ] Enable network policies
- [ ] Configure pod security policies
- [ ] Set up monitoring dashboards
- [ ] Test disaster recovery scenarios
- [ ] Document runbooks for common issues

## Additional Resources

- [YARP Documentation](https://microsoft.github.io/reverse-proxy/)
- [Kubernetes HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Polly Documentation](https://github.com/App-vNext/Polly)
- [OpenTelemetry .NET](https://opentelemetry.io/docs/instrumentation/net/)

## Support

For issues or questions:
1. Check the gateway logs: `kubectl logs deployment/mentorplatform-gateway`
2. Review the [Gateway README](be/src/MentorPlatform.Gateway/README.md)
3. Review the [Kubernetes README](be/src/MentorPlatform.Gateway/k8s/README.md)
