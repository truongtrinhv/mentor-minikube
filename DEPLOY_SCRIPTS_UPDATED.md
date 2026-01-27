# Deploy Scripts Updated with RabbitMQ Integration

## Overview
Both `deploy-all.sh` and `deploy-all.ps1` have been updated to include RabbitMQ deployment as part of the complete deployment pipeline.

## Changes Made

### Deployment Order
The scripts now deploy services in this order:
1. **Minikube & Docker** - Environment setup
2. **Docker Images** - Build API, Gateway, and Frontend
3. **RabbitMQ** ✨ NEW
4. **Backend API** - Depends on RabbitMQ
5. **API Gateway** - Reverse proxy/load balancer
6. **Frontend** - React application

### RabbitMQ Deployment Steps

#### In `deploy-all.sh` (Bash)
```bash
# Deploy RabbitMQ
kubectl apply -f be/src/MentorPlatform.API/k8s/rabbitmq.yaml

# Wait for RabbitMQ to be ready
kubectl wait --for=condition=ready pod -l app=rabbitmq -n mentorplatform --timeout=300s
```

#### In `deploy-all.ps1` (PowerShell)
```powershell
# Deploy RabbitMQ
kubectl apply -f be\src\MentorPlatform.API\k8s\rabbitmq.yaml

# Wait for RabbitMQ to be ready
kubectl wait --for=condition=ready pod -l app=rabbitmq -n mentorplatform --timeout=300s
```

### Access Information Added
Both scripts now display RabbitMQ access information in the summary:

```
RabbitMQ Management UI:
  URL:      http://{MINIKUBE_IP}:31672
  Username: guest
  Password: guest

RabbitMQ AMQP:
  Host:     rabbitmq (internal)
  Port:     5672
  VHost:    /
```

## Usage

### On Linux/Mac
```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

### On Windows
```powershell
.\deploy-all.ps1
```

## Deployment Timeline
- **Prerequisites Check** - ~5 seconds
- **Minikube Startup** - ~30 seconds (if not running)
- **Docker Build** - ~2-3 minutes
- **RabbitMQ Deployment** - ~30 seconds
- **RabbitMQ Ready** - ~30-60 seconds
- **Backend API Deployment** - ~30 seconds
- **Backend Ready** - ~30-60 seconds
- **Gateway Deployment** - ~30 seconds
- **Gateway Ready** - ~30-60 seconds
- **Frontend Deployment** - ~30 seconds
- **Frontend Ready** - ~30-60 seconds

**Total Time**: ~5-8 minutes

## Verification
After deployment completes, you can verify RabbitMQ:

```bash
# Check RabbitMQ pod status
kubectl get pods -n mentorplatform -l app=rabbitmq

# View RabbitMQ logs
kubectl logs -n mentorplatform rabbitmq-0

# Health check
kubectl exec -n mentorplatform rabbitmq-0 -- rabbitmq-diagnostics ping
```

## Next Steps
1. Run the deployment script: `./deploy-all.sh` or `deploy-all.ps1`
2. Access RabbitMQ Management UI at the displayed URL
3. Verify all services are running
4. Check queues and exchanges in RabbitMQ Management UI
5. Test event publishing and saga workflows

## Related Documentation
- [RABBITMQ_INTEGRATION_GUIDE.md](RABBITMQ_INTEGRATION_GUIDE.md)
- [RABBITMQ_DEPLOYMENT_SUMMARY.md](RABBITMQ_DEPLOYMENT_SUMMARY.md)
- [RABBITMQ_QUICK_REFERENCE.md](RABBITMQ_QUICK_REFERENCE.md)
