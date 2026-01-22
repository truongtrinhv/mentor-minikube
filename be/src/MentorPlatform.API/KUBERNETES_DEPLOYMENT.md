# MentorPlatform Kubernetes Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the MentorPlatform API to Kubernetes in WSL.

## Prerequisites

### 1. WSL Setup
Ensure you have WSL2 installed with Ubuntu or another Linux distribution.

### 2. Docker Desktop
- Install Docker Desktop for Windows
- Enable Kubernetes in Docker Desktop settings
- Enable WSL2 integration

### 3. kubectl
Verify kubectl is installed:
```bash
kubectl version --client
```

## Architecture

### Components
- **API Server**: .NET 9.0 Web API (2 replicas)
- **Database**: SQL Server 2022 (1 replica)
- **Storage**: Persistent Volume for database
- **Services**: NodePort (30080) and LoadBalancer

### Kubernetes Resources
- `deployment.yaml`: API application deployment
- `service.yaml`: NodePort and LoadBalancer services
- `database.yaml`: SQL Server deployment with PVC
- `configmap.yaml`: Non-sensitive configuration
- `secret.yaml`: JWT keys and sensitive data

## Configuration

### 1. Update Secret Values

Edit `k8s/secret.yaml` and replace the following placeholders:

```yaml
# Email credentials
EmailSettingsOptions__FromEmail: "your-email@gmail.com"
EmailSettingsOptions__Password: "your-app-password"

# Cloudinary credentials
FileStorageOptions__CloudinaryStorageOptions__CloudName: "your-cloud-name"
FileStorageOptions__CloudinaryStorageOptions__ApiKey: "your-api-key"
FileStorageOptions__CloudinaryStorageOptions__ApiSecret: "your-api-secret"
```

**Note**: JWT keys are already configured in the secret file.

### 2. Update CORS Origins (Optional)

Edit `k8s/configmap.yaml` to add your frontend URLs:

```yaml
CorsOptions__AllowedOrigins__0: "https://your-frontend-domain.com"
CorsOptions__AllowedOrigins__1: "http://localhost:3000"
```

## Deployment Instructions

### Option 1: Automated Deployment (Recommended)

1. Open WSL terminal and navigate to the project:
```bash
cd /mnt/c/Projects/NT-RK-MentorPlatform-main/be/src/MentorPlatform.API
```

2. Make the deployment script executable:
```bash
chmod +x k8s/deploy.sh
```

3. Run the deployment script:
```bash
./k8s/deploy.sh
```

The script will:
- Build the Docker image
- Deploy SQL Server database
- Apply ConfigMap and Secret
- Deploy the API application
- Create services
- Display deployment status and access URLs

### Option 2: Manual Deployment

1. Navigate to the project directory:
```bash
cd /mnt/c/Projects/NT-RK-MentorPlatform-main/be/src
```

2. Build the Docker image:
```bash
docker build -t mentorplatform-api:latest -f MentorPlatform.API/Dockerfile .
```

3. Deploy the database:
```bash
kubectl apply -f MentorPlatform.API/k8s/database.yaml
```

4. Wait for database to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=mssql --timeout=180s
```

5. Deploy ConfigMap and Secret:
```bash
kubectl apply -f MentorPlatform.API/k8s/configmap.yaml
kubectl apply -f MentorPlatform.API/k8s/secret.yaml
```

6. Deploy the application:
```bash
kubectl apply -f MentorPlatform.API/k8s/deployment.yaml
kubectl apply -f MentorPlatform.API/k8s/service.yaml
```

7. Wait for deployment to be ready:
```bash
kubectl rollout status deployment/mentorplatform-api
```

## Verification

### Check Deployment Status
```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

### View Logs
```bash
# View API logs
kubectl logs -f deployment/mentorplatform-api

# View database logs
kubectl logs -f deployment/mssql
```

### Test the API
```bash
# Using NodePort (default: 30080)
curl http://localhost:30080/health

# Using kubectl port-forward
kubectl port-forward svc/mentorplatform-api-service 8080:80
curl http://localhost:8080/health
```

## Access URLs

### From WSL/Linux
- **NodePort**: `http://localhost:30080`
- **API Health**: `http://localhost:30080/health`
- **Swagger**: `http://localhost:30080/swagger`

### From Windows
- **NodePort**: `http://localhost:30080`
- Or use the LoadBalancer external IP (if available)

## Database Management

### Connect to SQL Server
```bash
# Get pod name
kubectl get pods -l app=mssql

# Connect to database
kubectl exec -it <mssql-pod-name> -- /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd'
```

### Run Migrations
You may need to run EF Core migrations:
```bash
# Get API pod name
kubectl get pods -l app=mentorplatform-api

# Execute migrations
kubectl exec -it <api-pod-name> -- dotnet ef database update
```

## Scaling

### Scale API Replicas
```bash
kubectl scale deployment/mentorplatform-api --replicas=3
```

### Auto-scaling (Optional)
Create a Horizontal Pod Autoscaler:
```bash
kubectl autoscale deployment mentorplatform-api --cpu-percent=70 --min=2 --max=10
```

## Troubleshooting

### Pod Not Starting
```bash
# Describe pod to see events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
```

### Database Connection Issues
```bash
# Verify database is running
kubectl get pods -l app=mssql

# Check database logs
kubectl logs -l app=mssql

# Test connection from API pod
kubectl exec -it <api-pod-name> -- ping mssql-service
```

### Image Pull Issues
```bash
# Verify image exists
docker images | grep mentorplatform

# Rebuild image
docker build -t mentorplatform-api:latest -f MentorPlatform.API/Dockerfile .
```

## Updating the Application

### Update Configuration
```bash
# Edit ConfigMap or Secret
kubectl edit configmap mentorplatform-config
kubectl edit secret mentorplatform-secrets

# Restart deployment to pick up changes
kubectl rollout restart deployment/mentorplatform-api
```

### Deploy New Version
```bash
# Build new image
docker build -t mentorplatform-api:v2 -f MentorPlatform.API/Dockerfile .

# Update deployment
kubectl set image deployment/mentorplatform-api mentorplatform-api=mentorplatform-api:v2

# Check rollout status
kubectl rollout status deployment/mentorplatform-api
```

### Rollback
```bash
# View rollout history
kubectl rollout history deployment/mentorplatform-api

# Rollback to previous version
kubectl rollout undo deployment/mentorplatform-api
```

## Cleanup

### Remove All Resources
```bash
kubectl delete -f MentorPlatform.API/k8s/
```

### Remove Persistent Data
```bash
kubectl delete pvc mssql-pvc
```

## Production Considerations

### Security
1. ✅ Use Kubernetes Secrets for sensitive data
2. ✅ Run containers as non-root users
3. ⚠️ Enable TLS/HTTPS with Ingress
4. ⚠️ Implement network policies
5. ⚠️ Use private container registry

### High Availability
1. ✅ Multiple API replicas (current: 2)
2. ⚠️ Database replication/clustering
3. ⚠️ Load balancer configuration
4. ⚠️ Persistent volume backup strategy

### Monitoring
1. Consider adding Prometheus for metrics
2. Use Grafana for visualization
3. Implement centralized logging (ELK/Loki)
4. Set up alerts for critical failures

### Resources
- Adjust CPU/memory limits based on load testing
- Monitor resource usage: `kubectl top pods`
- Consider using resource quotas

## Support

For issues or questions:
1. Check pod logs: `kubectl logs <pod-name>`
2. Review events: `kubectl get events --sort-by='.lastTimestamp'`
3. Describe resources: `kubectl describe <resource-type> <resource-name>`

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Desktop Kubernetes](https://docs.docker.com/desktop/kubernetes/)
- [.NET on Docker](https://learn.microsoft.com/en-us/dotnet/core/docker/introduction)
