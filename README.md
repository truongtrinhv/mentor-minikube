# MentorPlatform - Full Stack Application with API Gateway

A comprehensive mentoring platform with a React frontend, .NET 8 backend API, and high-availability YARP API Gateway deployed on Kubernetes.

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (React+Vite)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Ingress (nginx)               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   API Gateway (YARP)            │
│   - Load Balancing              │
│   - Rate Limiting               │
│   - Circuit Breaker             │
│   - 3-10 Replicas (HPA)         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Backend API (.NET 8)          │
│   - Clean Architecture          │
│   - CQRS Pattern                │
│   - 2 Replicas                  │
└─────────────────────────────────┘
```

## Features

### API Gateway (NEW!)
- ✅ **High Availability**: 3-10 replicas with auto-scaling
- ✅ **Load Balancing**: Round-robin distribution
- ✅ **Rate Limiting**: 100 requests/min per IP
- ✅ **Circuit Breaker**: Prevents cascading failures
- ✅ **Health Checks**: Active & passive monitoring
- ✅ **Observability**: Prometheus metrics + OpenTelemetry
- ✅ **Zero Downtime**: Rolling updates with PDB

### Backend API
- Clean Architecture (Domain, Application, Infrastructure, Presentation)
- CQRS with MediatR
- JWT Authentication
- SignalR for real-time communication
- PostgreSQL database
- Email notifications
- File storage

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- Tailwind CSS
- React Router
- Axios for API calls

## Quick Start

### Prerequisites
- Docker
- Kubernetes cluster (Minikube for local)
- kubectl CLI
- .NET 8.0 SDK
- Node.js 18+

### Complete Deployment (Recommended)

**Linux/macOS:**
```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

**Windows (PowerShell):**
```powershell
.\deploy-all.ps1
```

This will:
1. Start Minikube (if not running)
2. Build all Docker images
3. Deploy Backend API
4. Deploy API Gateway with HA
5. Deploy Frontend
6. Show access URLs

### Individual Component Deployment

#### 1. Backend API Only
```bash
cd be/src/MentorPlatform.API/k8s
./deploy.sh  # or deploy.ps1 on Windows
```

#### 2. API Gateway Only
```bash
cd be/src/MentorPlatform.Gateway/k8s
./deploy.sh  # or deploy.ps1 on Windows
```

#### 3. Frontend Only
```bash
cd fe/k8s
kubectl apply -f .
```

## Access URLs

After deployment, get Minikube IP:
```bash
minikube ip
```

### NodePort Access (Development)
- **API Gateway**: `http://<minikube-ip>:30000`
- **Backend API Direct**: `http://<minikube-ip>:30080`
- **Frontend**: `http://<minikube-ip>:30001`

### Ingress Access (Production-like)

Add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
<minikube-ip> api.mentorplatform.local
<minikube-ip> mentorplatform.local
```

Then access:
- **API Gateway**: `http://api.mentorplatform.local`
- **Frontend**: `http://mentorplatform.local`

## API Gateway Endpoints

| Endpoint | Description |
|----------|-------------|
| `/health` | Health check |
| `/metrics` | Prometheus metrics |
| `/api/*` | Backend API routes |
| `/hubs/*` | SignalR WebSockets |
| `/swagger/*` | API documentation |

## Monitoring & Testing

### Check Deployment Status
```bash
# All deployments
kubectl get deployments

# Gateway specific
kubectl get pods -l app=mentorplatform-gateway
kubectl get hpa mentorplatform-gateway-hpa
kubectl get pdb mentorplatform-gateway-pdb
```

### View Logs
```bash
# Gateway logs
kubectl logs -f deployment/mentorplatform-gateway

# Backend API logs
kubectl logs -f deployment/mentorplatform-api

# Frontend logs
kubectl logs -f deployment/mentorplatform-fe
```

### Test Gateway Health
```bash
# Health check
curl http://<minikube-ip>:30000/health

# Prometheus metrics
curl http://<minikube-ip>:30000/metrics

# API through gateway
curl http://<minikube-ip>:30000/api/health
```

### Test Auto-Scaling
```bash
# Generate load (requires 'hey' tool)
hey -z 60s -c 50 http://<minikube-ip>:30000/api/health

# Watch scaling
kubectl get hpa mentorplatform-gateway-hpa -w
```

### Test Rate Limiting
```bash
# Send 150 requests (exceeds 100/min limit)
for i in {1..150}; do
  curl -s -w "%{http_code}\n" http://<minikube-ip>:30000/api/health
done
# Should see HTTP 429 responses
```

## Configuration

### Gateway Configuration
- **Config**: [be/src/MentorPlatform.Gateway/appsettings.json](be/src/MentorPlatform.Gateway/appsettings.json)
- **K8s Manifests**: [be/src/MentorPlatform.Gateway/k8s/](be/src/MentorPlatform.Gateway/k8s/)
- **Documentation**: [GATEWAY_DEPLOYMENT_GUIDE.md](GATEWAY_DEPLOYMENT_GUIDE.md)

### Backend API Configuration
- **Config**: [be/src/MentorPlatform.API/appsettings.json](be/src/MentorPlatform.API/appsettings.json)
- **K8s Manifests**: [be/src/MentorPlatform.API/k8s/](be/src/MentorPlatform.API/k8s/)

### Frontend Configuration
- **K8s Manifests**: [fe/k8s/](fe/k8s/)
- **Build Config**: [fe/vite.config.ts](fe/vite.config.ts)

## Development

### Run Backend Locally
```bash
cd be/src/MentorPlatform.API
dotnet run
```

### Run Gateway Locally
```bash
cd be/src/MentorPlatform.Gateway
dotnet run
# Access at http://localhost:5000
```

### Run Frontend Locally
```bash
cd fe
npm install
npm run dev
# Access at http://localhost:5173
```

## Troubleshooting

### Gateway Issues
```bash
# Check gateway status
kubectl describe deployment mentorplatform-gateway

# Check HPA events
kubectl describe hpa mentorplatform-gateway-hpa

# Check circuit breaker logs
kubectl logs deployment/mentorplatform-gateway | grep "Circuit"
```

### Backend Issues
```bash
# Check backend pods
kubectl get pods -l app=mentorplatform-api

# Check backend logs
kubectl logs deployment/mentorplatform-api --tail=100
```

### Rollback Deployment
```bash
# Gateway
kubectl rollout undo deployment/mentorplatform-gateway

# Backend
kubectl rollout undo deployment/mentorplatform-api
```

## Clean Up

### Delete All Resources
```bash
# Delete gateway
kubectl delete -f be/src/MentorPlatform.Gateway/k8s/

# Delete backend
kubectl delete -f be/src/MentorPlatform.API/k8s/

# Delete frontend
kubectl delete -f fe/k8s/

# Or delete everything
kubectl delete all --all
```

### Stop Minikube
```bash
minikube stop
```

## Project Structure

```
mentor-minikube/
├── be/                          # Backend (.NET 8)
│   ├── MentorPlatform.sln
│   └── src/
│       ├── MentorPlatform.API/           # Main API project
│       ├── MentorPlatform.Gateway/       # YARP API Gateway (NEW!)
│       ├── MentorPlatform.Application/   # Business logic
│       ├── MentorPlatform.Domain/        # Domain models
│       ├── MentorPlatform.Infrastructure/# External services
│       └── MentorPlatform.Persistence/   # Database
├── fe/                          # Frontend (React)
│   ├── src/
│   ├── k8s/                     # Kubernetes manifests
│   └── package.json
├── deploy-all.sh                # Complete deployment script
├── deploy-all.ps1               # Windows deployment script
├── GATEWAY_DEPLOYMENT_GUIDE.md  # Detailed gateway docs
└── README.md
```

## Documentation

- **Gateway Guide**: [GATEWAY_DEPLOYMENT_GUIDE.md](GATEWAY_DEPLOYMENT_GUIDE.md)
- **Gateway README**: [be/src/MentorPlatform.Gateway/README.md](be/src/MentorPlatform.Gateway/README.md)
- **Gateway K8s README**: [be/src/MentorPlatform.Gateway/k8s/README.md](be/src/MentorPlatform.Gateway/k8s/README.md)

## Performance Tuning

### Gateway Resources
Default allocation:
- **Requests**: 100m CPU, 128Mi Memory
- **Limits**: 500m CPU, 512Mi Memory

Adjust in [deployment.yaml](be/src/MentorPlatform.Gateway/k8s/deployment.yaml)

### Auto-Scaling
- **Min Replicas**: 3
- **Max Replicas**: 10
- **CPU Target**: 70%
- **Memory Target**: 80%

Configure in [hpa.yaml](be/src/MentorPlatform.Gateway/k8s/hpa.yaml)

### Rate Limits
Default: 100 requests/min per IP

Adjust in [appsettings.json](be/src/MentorPlatform.Gateway/appsettings.json):
```json
"RateLimiting": {
  "FixedWindow": {
    "PermitLimit": 200,
    "Window": "00:01:00"
  }
}
```

## Production Checklist

- [ ] Configure TLS/HTTPS
- [ ] Set up cert-manager
- [ ] Configure production rate limits
- [ ] Set up log aggregation
- [ ] Configure Prometheus monitoring
- [ ] Set up alerting
- [ ] Review resource limits
- [ ] Enable network policies
- [ ] Configure backup/restore
- [ ] Document runbooks

## Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Build and test in Kubernetes
5. Submit PR

## License

MIT License
