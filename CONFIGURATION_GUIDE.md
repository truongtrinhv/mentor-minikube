# Environment Variables & Configuration

## API Gateway Configuration

### Environment Variables (ConfigMap)

```yaml
# be/src/MentorPlatform.Gateway/k8s/configmap.yaml

ASPNETCORE_ENVIRONMENT: "Production"
ASPNETCORE_URLS: "http://+:8080"
ASPNETCORE_HTTP_PORTS: "8080"
```

### appsettings.json Variables

#### Logging
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Yarp": "Information"
    }
  }
}
```

#### Reverse Proxy Routes
```json
{
  "ReverseProxy": {
    "Routes": {
      "api-route": {
        "ClusterId": "api-cluster",
        "Match": {
          "Path": "/api/{**catch-all}"
        }
      }
    }
  }
}
```

#### Clusters (Backend Services)
```json
{
  "ReverseProxy": {
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
  }
}
```

#### Rate Limiting
```json
{
  "RateLimiting": {
    "FixedWindow": {
      "PermitLimit": 100,
      "Window": "00:01:00",
      "QueueLimit": 10
    }
  }
}
```

#### Circuit Breaker
```json
{
  "CircuitBreaker": {
    "FailureThreshold": 0.5,
    "SamplingDuration": "00:00:30",
    "MinimumThroughput": 10,
    "BreakDuration": "00:00:30"
  }
}
```

#### Health Checks
```json
{
  "ReverseProxy": {
    "Clusters": {
      "api-cluster": {
        "HealthCheck": {
          "Active": {
            "Enabled": true,
            "Interval": "00:00:30",
            "Timeout": "00:00:10",
            "Path": "/health"
          },
          "Passive": {
            "Enabled": true,
            "ReactivationPeriod": "00:01:00"
          }
        }
      }
    }
  }
}
```

## Backend API Configuration

### Environment Variables (ConfigMap)

```yaml
# be/src/MentorPlatform.API/k8s/configmap.yaml

ASPNETCORE_ENVIRONMENT: "Production"
ASPNETCORE_URLS: "http://+:8080"
ConnectionStrings__DefaultConnection: "Host=postgres;Database=mentorplatform;Username=postgres;Password=yourpassword"
```

### Secrets (Secret)

```yaml
# be/src/MentorPlatform.API/k8s/secret.yaml

# Base64 encoded values
JWT_PRIVATE_KEY: "<base64-encoded-private-key>"
JWT_PUBLIC_KEY: "<base64-encoded-public-key>"
SMTP_PASSWORD: "<base64-encoded-smtp-password>"
```

## Frontend Configuration

### Environment Variables (ConfigMap)

```yaml
# fe/k8s/configmap.yaml

VITE_API_URL: "http://api.mentorplatform.local"
VITE_WS_URL: "ws://api.mentorplatform.local"
```

## Kubernetes Resource Configurations

### Gateway Deployment

```yaml
# Resources
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# Probes
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Gateway HPA

```yaml
minReplicas: 3
maxReplicas: 10

metrics:
- type: Resource
  resource:
    name: cpu
    target:
      type: Utilization
      averageUtilization: 70
- type: Resource
  resource:
    name: memory
    target:
      type: Utilization
      averageUtilization: 80
```

### Gateway PDB

```yaml
minAvailable: 2
```

## Configuration Override Priority

### Gateway
1. Command-line arguments (highest)
2. Environment variables
3. appsettings.{Environment}.json
4. appsettings.json
5. Default values (lowest)

### Example Override

**Development:**
```bash
export ASPNETCORE_ENVIRONMENT=Development
dotnet run
# Uses appsettings.Development.json
```

**Production (Kubernetes):**
```yaml
# ConfigMap sets environment
env:
- name: ASPNETCORE_ENVIRONMENT
  value: "Production"
# Uses appsettings.json
```

## Common Configuration Tasks

### 1. Change Rate Limit

Edit `appsettings.json`:
```json
"RateLimiting": {
  "FixedWindow": {
    "PermitLimit": 200,  // Increase from 100
    "Window": "00:01:00"
  }
}
```

Then rebuild and redeploy:
```bash
docker build -t mentorplatform-gateway:latest .
kubectl rollout restart deployment/mentorplatform-gateway
```

### 2. Add New Backend Service

Edit `appsettings.json`:
```json
"ReverseProxy": {
  "Routes": {
    "new-service-route": {
      "ClusterId": "new-service-cluster",
      "Match": {
        "Path": "/new-service/{**catch-all}"
      }
    }
  },
  "Clusters": {
    "new-service-cluster": {
      "Destinations": {
        "destination-1": {
          "Address": "http://new-service:8080"
        }
      }
    }
  }
}
```

### 3. Adjust Circuit Breaker

Edit `appsettings.json`:
```json
"CircuitBreaker": {
  "FailureThreshold": 0.6,      // Increase tolerance
  "SamplingDuration": "00:01:00", // Longer sampling
  "MinimumThroughput": 20,        // More requests needed
  "BreakDuration": "00:01:00"     // Longer break
}
```

### 4. Change Health Check Interval

Edit `appsettings.json`:
```json
"HealthCheck": {
  "Active": {
    "Enabled": true,
    "Interval": "00:00:10",  // More frequent (10s)
    "Timeout": "00:00:05"
  }
}
```

### 5. Enable HTTPS Redirect

Edit `appsettings.json`:
```json
"Routes": {
  "api-route": {
    "Transforms": [
      {
        "RequestHeader": "X-Forwarded-Proto",
        "Set": "https"
      }
    ]
  }
}
```

### 6. Adjust HPA Thresholds

Edit `k8s/hpa.yaml`:
```yaml
metrics:
- type: Resource
  resource:
    name: cpu
    target:
      averageUtilization: 60  # Lower threshold (scale earlier)
```

Apply:
```bash
kubectl apply -f k8s/hpa.yaml
```

### 7. Change Replica Count

Edit `k8s/deployment.yaml`:
```yaml
spec:
  replicas: 5  # Increase from 3
```

Or scale directly:
```bash
kubectl scale deployment mentorplatform-gateway --replicas=5
```

### 8. Update Backend Service Address

Edit `appsettings.json`:
```json
"Clusters": {
  "api-cluster": {
    "Destinations": {
      "api-destination-1": {
        "Address": "http://new-backend-service:8080"
      }
    }
  }
}
```

### 9. Enable Session Affinity

Edit `appsettings.json`:
```json
"Clusters": {
  "api-cluster": {
    "SessionAffinity": {
      "Enabled": true,
      "Policy": "Cookie",
      "FailurePolicy": "Redistribute"
    }
  }
}
```

### 10. Add Multiple Backend Destinations

Edit `appsettings.json`:
```json
"Clusters": {
  "api-cluster": {
    "Destinations": {
      "api-destination-1": {
        "Address": "http://backend-api-1:8080"
      },
      "api-destination-2": {
        "Address": "http://backend-api-2:8080"
      },
      "api-destination-3": {
        "Address": "http://backend-api-3:8080"
      }
    },
    "LoadBalancingPolicy": "RoundRobin"
  }
}
```

## Configuration Validation

### Test Configuration Locally

```bash
cd be/src/MentorPlatform.Gateway

# Validate JSON syntax
cat appsettings.json | jq .

# Run locally
dotnet run

# Test health
curl http://localhost:5000/health

# View configuration
curl http://localhost:5000/debug/routes  # If debug enabled
```

### Validate Kubernetes Config

```bash
# Validate YAML syntax
kubectl apply --dry-run=client -f k8s/deployment.yaml

# Validate and show diff
kubectl diff -f k8s/deployment.yaml

# Check ConfigMap
kubectl get configmap gateway-config -o yaml
```

## Environment-Specific Configurations

### Development (appsettings.Development.json)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Yarp": "Debug"
    }
  },
  "ReverseProxy": {
    "Clusters": {
      "api-cluster": {
        "Destinations": {
          "api-destination-1": {
            "Address": "http://localhost:30080"  // Direct to NodePort
          }
        }
      }
    }
  }
}
```

### Staging

```json
{
  "RateLimiting": {
    "FixedWindow": {
      "PermitLimit": 150  // Higher than dev, lower than prod
    }
  }
}
```

### Production

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Yarp": "Information"
    }
  },
  "RateLimiting": {
    "FixedWindow": {
      "PermitLimit": 200  // Production rate limit
    }
  }
}
```

## Security Best Practices

### 1. Never Commit Secrets
- Use Kubernetes Secrets for sensitive data
- Use environment variables for configuration
- Keep secrets out of appsettings.json

### 2. Use Strong JWT Keys
```bash
# Generate RSA key pair
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Base64 encode for Kubernetes Secret
cat private.pem | base64 -w 0
cat public.pem | base64 -w 0
```

### 3. Enable HTTPS in Production
- Use cert-manager for SSL certificates
- Configure TLS in Ingress
- Enforce HTTPS redirects

### 4. Restrict CORS
```csharp
// In Program.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://mentorplatform.com")
              .AllowCredentials()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

## Troubleshooting Configuration Issues

### Issue: Configuration not loading

```bash
# Check ConfigMap
kubectl get configmap gateway-config -o yaml

# Check if pod has latest config
kubectl exec deployment/mentorplatform-gateway -- printenv

# Restart to reload
kubectl rollout restart deployment/mentorplatform-gateway
```

### Issue: Wrong backend address

```bash
# Test from gateway pod
kubectl exec -it deployment/mentorplatform-gateway -- curl http://mentorplatform-api-service/health

# Check service endpoints
kubectl get endpoints mentorplatform-api-service
```

### Issue: Rate limiting not working

```bash
# Check logs for rate limit messages
kubectl logs deployment/mentorplatform-gateway | grep -i "too many"

# Verify configuration
kubectl exec deployment/mentorplatform-gateway -- cat /app/appsettings.json | grep -A5 RateLimiting
```

## Configuration Checklist

Before deploying:

- [ ] Update backend service addresses
- [ ] Configure appropriate rate limits
- [ ] Set correct environment (Production/Staging/Development)
- [ ] Configure health check intervals
- [ ] Set resource requests/limits
- [ ] Configure HPA min/max replicas
- [ ] Set PDB minAvailable
- [ ] Configure logging levels
- [ ] Enable/disable debug features
- [ ] Review security settings (CORS, headers)
- [ ] Configure monitoring endpoints
- [ ] Set appropriate timeouts
- [ ] Configure circuit breaker thresholds
