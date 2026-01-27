# MentorPlatform Gateway - Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the MentorPlatform Gateway with high availability.

## Features

### High Availability
- **3 replicas minimum** for redundancy
- **Pod Anti-Affinity** to spread pods across nodes
- **Zero downtime deployments** with rolling updates
- **Pod Disruption Budget** ensures minimum 2 pods during maintenance
- **Horizontal Pod Autoscaler** scales from 3-10 replicas based on load

### Resilience
- **Health checks** (liveness, readiness, startup probes)
- **Circuit breaker** protection against downstream failures
- **Rate limiting** to prevent abuse
- **Graceful shutdown** with 60s termination period

### Observability
- **Prometheus metrics** on `/metrics` endpoint
- **OpenTelemetry** tracing and metrics
- **Structured logging** with request tracking

## Deployment

### Using the deployment script (recommended)

**Linux/macOS:**
```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

**Windows (PowerShell):**
```powershell
cd k8s
.\deploy.ps1
```

### Manual deployment

```bash
# Apply all manifests
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml
kubectl apply -f ingress.yaml

# Check deployment status
kubectl get all -l app=mentorplatform-gateway
```

## Access

### NodePort (Development)
```bash
# Get Minikube IP
minikube ip

# Access gateway
curl http://<minikube-ip>:30000/health
```

### Ingress (Production-like)
Add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
<minikube-ip> api.mentorplatform.local
```

Then access:
```bash
curl http://api.mentorplatform.local/health
```

## Endpoints

- `GET /health` - Health check endpoint
- `GET /metrics` - Prometheus metrics
- `GET /api/*` - Proxied to backend API

## Configuration

### Environment Variables
Configured in `configmap.yaml`:
- `ASPNETCORE_ENVIRONMENT` - Runtime environment (Production, Development)
- `ASPNETCORE_URLS` - Listening URLs

### YARP Configuration
Main configuration in `appsettings.json`:
- **Routes**: Path-based routing to backend services
- **Clusters**: Backend service endpoints
- **Health Checks**: Active and passive health checking
- **Load Balancing**: Round-robin distribution
- **Rate Limiting**: 100 requests/minute per IP

## Monitoring

### Check pod status
```bash
kubectl get pods -l app=mentorplatform-gateway
```

### View logs
```bash
kubectl logs -f deployment/mentorplatform-gateway
```

### Check HPA status
```bash
kubectl get hpa mentorplatform-gateway-hpa
```

### Check metrics
```bash
curl http://<gateway-url>/metrics
```

## Scaling

### Manual scaling
```bash
kubectl scale deployment mentorplatform-gateway --replicas=5
```

### Auto-scaling
The HPA automatically scales based on:
- **CPU**: Target 70% utilization
- **Memory**: Target 80% utilization
- **Min replicas**: 3
- **Max replicas**: 10

## Troubleshooting

### Check deployment status
```bash
kubectl rollout status deployment/mentorplatform-gateway
```

### View events
```bash
kubectl get events --sort-by='.lastTimestamp' -l app=mentorplatform-gateway
```

### Restart deployment
```bash
kubectl rollout restart deployment/mentorplatform-gateway
```

### Debug pod
```bash
kubectl exec -it deployment/mentorplatform-gateway -- /bin/bash
```

## High Availability Details

### Pod Anti-Affinity
Ensures pods are distributed across different nodes to prevent single point of failure.

### Pod Disruption Budget
Maintains minimum 2 pods during:
- Node maintenance
- Cluster upgrades
- Voluntary disruptions

### Rolling Updates
- **Max surge**: 1 additional pod during update
- **Max unavailable**: 0 pods (zero downtime)

### Health Checks
- **Startup probe**: 100 seconds max startup time
- **Liveness probe**: Restarts unhealthy pods
- **Readiness probe**: Removes unhealthy pods from service

## Security

- **Non-root user** (UID 1000)
- **No privilege escalation**
- **Dropped capabilities** (all)
- **Security headers** (X-Frame-Options, CSP, etc.)
- **Rate limiting** per IP address
