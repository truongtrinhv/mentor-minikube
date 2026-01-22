# Quick Start - Kubernetes Deployment

## Prerequisites
✅ Docker Desktop with Kubernetes enabled  
✅ WSL2 (if using bash script)  
✅ kubectl installed  

## Deploy in 3 Steps

### 1. Update Secrets
Edit `k8s/secret.yaml` and replace:
- Email credentials (FromEmail, Password)
- Cloudinary credentials (CloudName, ApiKey, ApiSecret)
- JWT keys are already configured ✅

### 2. Run Deployment

**Option A - Windows PowerShell:**
```powershell
cd c:\Projects\NT-RK-MentorPlatform-main\be\src\MentorPlatform.API
.\k8s\deploy.ps1 -Action deploy
```

**Option B - WSL/Linux:**
```bash
cd /mnt/c/Projects/NT-RK-MentorPlatform-main/be/src/MentorPlatform.API
chmod +x k8s/deploy.sh
./k8s/deploy.sh
```

### 3. Access Application
- **Health Check**: http://localhost:30080/health
- **Swagger UI**: http://localhost:30080/swagger
- **API Base**: http://localhost:30080

## What Gets Deployed

| Component | Details |
|-----------|---------|
| **API** | 2 replicas, .NET 9.0, Port 8080 |
| **Database** | SQL Server 2022, 5GB storage |
| **Services** | NodePort (30080) + LoadBalancer |
| **Secrets** | JWT keys, DB connection, Email, Cloudinary |

## Common Commands

```bash
# View all pods
kubectl get pods

# View logs
kubectl logs -f deployment/mentorplatform-api

# Restart deployment
kubectl rollout restart deployment/mentorplatform-api

# Scale replicas
kubectl scale deployment/mentorplatform-api --replicas=3

# Delete everything
kubectl delete -f k8s/
```

## Troubleshooting

**Pods not starting?**
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

**Database connection failed?**
```bash
kubectl logs -l app=mssql
kubectl get svc mssql-service
```

**Need to rebuild?**
```bash
docker build -t mentorplatform-api:latest -f Dockerfile ../
kubectl rollout restart deployment/mentorplatform-api
```

## File Structure

```
MentorPlatform.API/
├── Dockerfile                    # Multi-stage Docker build
├── .dockerignore                 # Docker build optimization
├── k8s/
│   ├── configmap.yaml           # Non-sensitive config
│   ├── secret.yaml              # JWT keys + credentials
│   ├── deployment.yaml          # API deployment
│   ├── service.yaml             # NodePort + LoadBalancer
│   ├── database.yaml            # SQL Server
│   ├── deploy.sh                # Bash deployment script
│   └── deploy.ps1               # PowerShell deployment script
├── Controllers/
│   └── HealthController.cs      # Health check endpoint
└── KUBERNETES_DEPLOYMENT.md     # Full documentation
```

## Security Notes

⚠️ **Before Production:**
1. Change SQL Server SA password
2. Use proper secrets management (Azure Key Vault, etc.)
3. Enable HTTPS/TLS
4. Configure network policies
5. Use private container registry

## Next Steps

1. ✅ Deploy to Kubernetes
2. 🔄 Test API endpoints
3. 🔄 Run database migrations
4. 🔄 Configure monitoring
5. 🔄 Set up CI/CD pipeline

📖 See [KUBERNETES_DEPLOYMENT.md](KUBERNETES_DEPLOYMENT.md) for detailed documentation.
