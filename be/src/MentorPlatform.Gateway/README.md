# MentorPlatform Gateway

A high-availability REST API Gateway built with YARP (Yet Another Reverse Proxy) for the MentorPlatform backend services.

## Features

### Core Gateway Features
- **Reverse Proxy**: Routes requests to backend services using YARP
- **Load Balancing**: Round-robin distribution across backend instances
- **Health Checks**: Active and passive health monitoring
- **Session Affinity**: Optional sticky sessions with cookie-based affinity

### High Availability
- **Multiple Replicas**: Runs with 3 replicas minimum
- **Auto-scaling**: HPA scales from 3-10 replicas based on CPU/memory
- **Zero Downtime**: Rolling updates with no service interruption
- **Pod Disruption Budget**: Maintains minimum availability during maintenance
- **Pod Anti-Affinity**: Spreads pods across nodes for redundancy

### Resilience & Reliability
- **Circuit Breaker**: Prevents cascading failures with Polly
- **Rate Limiting**: 100 requests/minute per IP address
- **Request Timeout**: 100 seconds default timeout
- **Retry Logic**: Automatic retries for transient failures
- **Graceful Shutdown**: 60 second termination grace period

### Observability
- **OpenTelemetry**: Distributed tracing and metrics
- **Prometheus Metrics**: Exposed on `/metrics` endpoint
- **Structured Logging**: Request/response logging
- **Health Endpoint**: `/health` for monitoring

### Security
- **Security Headers**: X-Frame-Options, CSP, HSTS, etc.
- **CORS Support**: Configurable cross-origin requests
- **Non-root Container**: Runs as UID 1000
- **Rate Limiting**: Protection against abuse
- **SSL/TLS Support**: Ready for HTTPS termination

## Quick Start

### Prerequisites
- .NET 8.0 SDK
- Docker
- Kubernetes cluster (or Minikube)
- kubectl CLI

### Local Development

```bash
# Run locally
dotnet run --project MentorPlatform.Gateway.csproj

# Access the gateway
curl http://localhost:5000/health
```

### Docker Build

```bash
# Build image
docker build -t mentorplatform-gateway:latest -f Dockerfile ..

# Run container
docker run -p 5000:8080 mentorplatform-gateway:latest
```

### Kubernetes Deployment

See [k8s/README.md](k8s/README.md) for detailed Kubernetes deployment instructions.

```bash
cd k8s
./deploy.sh  # Linux/macOS
# or
.\deploy.ps1  # Windows PowerShell
```

## Configuration

### appsettings.json

Key configuration sections:

#### Routes
Define path-based routing:
```json
"Routes": {
  "api-route": {
    "ClusterId": "api-cluster",
    "Match": {
      "Path": "/api/{**catch-all}"
    }
  }
}
```

#### Clusters
Define backend services:
```json
"Clusters": {
  "api-cluster": {
    "Destinations": {
      "api-destination-1": {
        "Address": "http://mentorplatform-api-service"
      }
    },
    "LoadBalancingPolicy": "RoundRobin"
  }
}
```

#### Health Checks
Configure active and passive health monitoring:
```json
"HealthCheck": {
  "Active": {
    "Enabled": true,
    "Interval": "00:00:30",
    "Path": "/health"
  },
  "Passive": {
    "Enabled": true,
    "Policy": "TransportFailureRate"
  }
}
```

#### Rate Limiting
```json
"RateLimiting": {
  "FixedWindow": {
    "PermitLimit": 100,
    "Window": "00:01:00"
  }
}
```

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Client    │─────▶│  Gateway (YARP)  │─────▶│  Backend    │
│             │      │  - Rate Limit    │      │  API        │
│             │      │  - Circuit Break │      │             │
│             │      │  - Load Balance  │      │             │
└─────────────┘      └──────────────────┘      └─────────────┘
                            │
                            │
                     ┌──────▼──────┐
                     │ Observability│
                     │ - Metrics    │
                     │ - Traces     │
                     │ - Logs       │
                     └──────────────┘
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `/health` | Health check endpoint |
| `/metrics` | Prometheus metrics |
| `/api/*` | Proxied to backend API |
| `/hubs/*` | SignalR WebSocket connections |
| `/swagger/*` | API documentation |

## Monitoring

### Metrics
Access Prometheus metrics:
```bash
curl http://localhost:5000/metrics
```

Key metrics:
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `yarp_proxy_*` - YARP-specific metrics

### Health Checks
```bash
curl http://localhost:5000/health
```

### Logs
View structured logs:
```bash
# Kubernetes
kubectl logs -f deployment/mentorplatform-gateway

# Docker
docker logs -f <container-id>
```

## Performance Tuning

### Resource Limits
Default resource allocation:
- **Requests**: 100m CPU, 128Mi memory
- **Limits**: 500m CPU, 512Mi memory

### Connection Pooling
- **Max connections per server**: 100
- **Keep-alive timeout**: 60 seconds
- **Activity timeout**: 120 seconds

### Auto-scaling
HPA configuration:
- **Min replicas**: 3
- **Max replicas**: 10
- **CPU target**: 70%
- **Memory target**: 80%

## Troubleshooting

### Gateway not routing requests
1. Check backend service is running:
   ```bash
   kubectl get pods -l app=mentorplatform-api
   ```

2. Check gateway configuration:
   ```bash
   kubectl logs deployment/mentorplatform-gateway | grep "YARP"
   ```

3. Verify health checks:
   ```bash
   curl http://<gateway-url>/health
   ```

### High latency
1. Check circuit breaker status in logs
2. Review backend service performance
3. Check HPA scaling events:
   ```bash
   kubectl get hpa mentorplatform-gateway-hpa
   ```

### Rate limiting issues
Adjust rate limits in `appsettings.json`:
```json
"RateLimiting": {
  "FixedWindow": {
    "PermitLimit": 200,  // Increase limit
    "Window": "00:01:00"
  }
}
```

## Best Practices

1. **Use Health Checks**: Always configure health checks for backend services
2. **Enable Metrics**: Monitor gateway performance with Prometheus
3. **Set Resource Limits**: Prevent resource exhaustion
4. **Configure Circuit Breaker**: Protect against cascading failures
5. **Use Rate Limiting**: Prevent abuse and DoS attacks
6. **Enable Logging**: Use structured logging for troubleshooting
7. **Test Auto-scaling**: Verify HPA works under load

## Contributing

When adding new routes or backend services:

1. Update `appsettings.json` with new routes and clusters
2. Add health check endpoints to backend services
3. Update documentation
4. Test locally before deploying to Kubernetes

## License

Part of the MentorPlatform project.
