# Alternative Deployment Strategy - Workaround for Network Issues

## Issue
Experiencing intermittent network connectivity to NuGet during Docker build in Minikube.

## Solution Options

### Option 1: Build Outside Docker First (Recommended)

This approach builds the application on your local machine first, then copies the pre-built files into a simpler Docker image.

#### Step 1: Build locally
```bash
cd /mnt/c/Projects/NT-RK-MentorPlatform-main/be/src
dotnet publish MentorPlatform.API/MentorPlatform.WebApi.csproj -c Release -o ./publish
```

#### Step 2: Use the lightweight Dockerfile
Create `Dockerfile.prebuilt`:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY ./publish .
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "MentorPlatform.WebApi.dll"]
```

#### Step 3: Build and deploy
```bash
eval $(minikube docker-env)
docker build -t mentorplatform-api:latest -f Dockerfile.prebuilt .
kubectl apply -f MentorPlatform.API/k8s/
```

### Option 2: Fix Network and Retry

#### Check Docker daemon network
```bash
# In WSL
curl -I https://api.nuget.org/v3/index.json

# If this fails, there's a network issue
# Try restarting Docker Desktop
```

#### Restart Minikube with different settings
```bash
minikube stop
minikube delete
minikube start --driver=docker --network-plugin=cni
```

#### Build with increased timeout
```bash
eval $(minikube docker-env)
export DOCKER_BUILDKIT=1
cd /mnt/c/Projects/NT-RK-MentorPlatform-main/be/src
docker build --network=host --progress=plain -t mentorplatform-api:latest -f MentorPlatform.API/Dockerfile . 2>&1 | tee build.log
```

### Option 3: Use Docker Desktop Kubernetes Instead of Minikube

If you have Docker Desktop with Kubernetes enabled:

#### Step 1: Switch context
```powershell
kubectl config use-context docker-desktop
```

#### Step 2: Build image (in PowerShell)
```powershell
cd c:\Projects\NT-RK-MentorPlatform-main\be\src
docker build -t mentorplatform-api:latest -f MentorPlatform.API\Dockerfile .
```

#### Step 3: Deploy
```powershell
cd c:\Projects\NT-RK-MentorPlatform-main\be\src\MentorPlatform.API
kubectl apply -f k8s/
```

### Option 4: Deploy Without Database (API Only - for testing)

If you just want to test the deployment without SQL Server:

#### Step 1: Comment out database dependency
Edit `k8s/secret.yaml` - use a connection string pointing to external DB or SQLite

#### Step 2: Skip database deployment
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

## Recommended Workflow

1. **Build locally first** (Option 1) - This is the most reliable
2. **Test the build output**
3. **Create simple Docker image from pre-built files**
4. **Deploy to Kubernetes**

## Next Steps

Choose one of the options above based on your preference. Option 1 is recommended as it bypasses the NuGet connectivity issues during Docker build.

Would you like me to implement Option 1 (pre-build strategy) for you?
