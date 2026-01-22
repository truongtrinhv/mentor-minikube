# MentorPlatform Frontend - Kubernetes Deployment Guide

This guide explains how to deploy the MentorPlatform frontend to Minikube.

## Prerequisites

- Minikube installed and running
- kubectl configured
- Docker installed

## Quick Start

### Windows

```cmd
deploy-minikube.bat
```

### Linux/Mac

```bash
chmod +x deploy-minikube.sh
./deploy-minikube.sh
```

## Manual Deployment Steps

### 1. Start Minikube

```bash
minikube start
```

### 2. Configure Docker Environment

```bash
# Linux/Mac
eval $(minikube docker-env)

# Windows (PowerShell)
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Windows (CMD)
@for /f "tokens=*" %i in ('minikube -p minikube docker-env --shell cmd') do @%i
```

### 3. Build Docker Image

```bash
docker build -t mentorplatform-frontend:latest \
  --build-arg VITE_API_URL_ROOT=http://mentorplatform-api-service:8080 \
  -f Dockerfile .
```

### 4. Apply Kubernetes Manifests

```bash
# Apply ConfigMap
kubectl apply -f k8s/configmap.yaml

# Apply Deployment
kubectl apply -f k8s/deployment.yaml

# Apply Service
kubectl apply -f k8s/service.yaml
```

### 5. Access the Application

```bash
# Get the URL
minikube service mentorplatform-frontend-service --url

# Or open in browser directly
minikube service mentorplatform-frontend-service
```

## Configuration

### Environment Variables

The application uses the following environment variable:

- `VITE_API_URL_ROOT`: URL of the backend API service

This is configured in [k8s/configmap.yaml](k8s/configmap.yaml):

```yaml
VITE_API_URL_ROOT: "http://mentorplatform-api-service:8080"
```

**Important**: The API service URL points to the Kubernetes service `mentorplatform-api-service` which should be the backend API service running in the same cluster.

### Updating Configuration

To update the API URL or other configuration:

1. Edit [k8s/configmap.yaml](k8s/configmap.yaml)
2. Apply the changes:
   ```bash
   kubectl apply -f k8s/configmap.yaml
   ```
3. Restart the deployment to pick up changes:
   ```bash
   kubectl rollout restart deployment/mentorplatform-frontend
   ```

## Kubernetes Resources

The deployment creates the following resources:

### ConfigMap
- **Name**: `mentorplatform-fe-config`
- **Purpose**: Stores environment variables

### Deployment
- **Name**: `mentorplatform-frontend`
- **Replicas**: 2
- **Image**: `mentorplatform-frontend:latest`
- **Container Port**: 80
- **Health Checks**: Liveness and Readiness probes on `/health`

### Service
- **Name**: `mentorplatform-frontend-service`
- **Type**: NodePort
- **Port**: 80
- **NodePort**: 30080

## Useful Commands

### Check Pod Status

```bash
kubectl get pods -l app=mentorplatform-frontend
```

### View Logs

```bash
# All pods
kubectl logs -l app=mentorplatform-frontend --tail=100 -f

# Specific pod
kubectl logs <pod-name> -f
```

### Check Service

```bash
kubectl get svc mentorplatform-frontend-service
```

### Describe Deployment

```bash
kubectl describe deployment mentorplatform-frontend
```

### Scale Deployment

```bash
kubectl scale deployment mentorplatform-frontend --replicas=3
```

### Update Image

```bash
# Rebuild image
docker build -t mentorplatform-frontend:latest -f Dockerfile .

# Restart deployment
kubectl rollout restart deployment/mentorplatform-frontend

# Check rollout status
kubectl rollout status deployment/mentorplatform-frontend
```

### Delete Resources

```bash
# Delete all resources
kubectl delete -f k8s/

# Or individually
kubectl delete deployment mentorplatform-frontend
kubectl delete service mentorplatform-frontend-service
kubectl delete configmap mentorplatform-fe-config
```

## Architecture

### Docker Image

The Docker image uses a multi-stage build:

1. **Builder Stage**: Builds the React application with Node.js
2. **Production Stage**: Serves the built files with Nginx

### Nginx Configuration

- Handles React Router routing (SPA)
- Gzip compression enabled
- Security headers configured
- Health check endpoint at `/health`
- Static asset caching

### API Integration

The frontend connects to the backend API using the service name `mentorplatform-api-service` which should resolve to the backend service within the Kubernetes cluster.

**Service Discovery**: Kubernetes DNS automatically resolves service names, so `http://mentorplatform-api-service:8080` will route to the backend API pods.

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -l app=mentorplatform-frontend

# Describe pod for events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
```

### Image Pull Errors

Make sure you're using Minikube's Docker daemon:

```bash
eval $(minikube docker-env)
```

Then rebuild the image.

### Cannot Access Service

```bash
# Check if service exists
kubectl get svc mentorplatform-frontend-service

# Get the URL
minikube service mentorplatform-frontend-service --url

# Check if Minikube tunnel is needed (for LoadBalancer type)
minikube tunnel
```

### API Connection Issues

1. Verify the backend API service is running:
   ```bash
   kubectl get svc mentorplatform-api-service
   ```

2. Check the ConfigMap has the correct API URL:
   ```bash
   kubectl get configmap mentorplatform-fe-config -o yaml
   ```

3. Test connectivity from a pod:
   ```bash
   kubectl exec -it <frontend-pod-name> -- wget -O- http://mentorplatform-api-service:8080/health
   ```

## Production Considerations

For production deployment (not Minikube):

1. **Change Image Pull Policy**: Update `imagePullPolicy` in [deployment.yaml](k8s/deployment.yaml) from `Never` to `IfNotPresent` or `Always`

2. **Use Image Registry**: Push image to a container registry (Docker Hub, ECR, GCR, etc.)

3. **Service Type**: Consider using `LoadBalancer` or `Ingress` instead of `NodePort`

4. **Resource Limits**: Adjust resource requests/limits based on actual usage

5. **Replicas**: Scale based on load requirements

6. **TLS/HTTPS**: Configure Ingress with TLS certificates

7. **Environment-Specific Config**: Use different ConfigMaps for dev/staging/prod
