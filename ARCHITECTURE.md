# MentorPlatform Architecture with API Gateway

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet / Users                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Ingress Controller                           │
│                      (nginx-ingress)                             │
│  - SSL Termination                                               │
│  - Path-based routing                                            │
│  - Load balancing                                                │
└────────────┬──────────────────────────────┬─────────────────────┘
             │                              │
             │ /api/*                       │ /
             ▼                              ▼
┌─────────────────────────────────┐   ┌────────────────────────────┐
│     API Gateway (YARP)          │   │      Frontend              │
│                                 │   │      (React SPA)           │
│  ┌──────────────────────────┐   │   │                            │
│  │ Features:                │   │   │  - React 18                │
│  │ - Load Balancing         │   │   │  - TypeScript              │
│  │ - Rate Limiting          │   │   │  - Vite                    │
│  │ - Circuit Breaker        │   │   │  - Tailwind CSS            │
│  │ - Health Checks          │   │   │                            │
│  │ - Request Transform      │   │   │  Deployment:               │
│  │ - OpenTelemetry          │   │   │  - 2 replicas              │
│  │ - Prometheus Metrics     │   │   │  - NodePort: 30001         │
│  └──────────────────────────┘   │   └────────────────────────────┘
│                                 │
│  Deployment:                    │
│  - 3-10 replicas (HPA)         │
│  - Pod Anti-Affinity           │
│  - PDB (min 2 available)       │
│  - NodePort: 30000             │
│                                 │
│  Endpoints:                     │
│  - /health (health check)      │
│  - /metrics (Prometheus)       │
│  - /api/* → Backend API        │
│  - /hubs/* → SignalR           │
└────────────┬────────────────────┘
             │
             │ Round-robin
             │ Health checks
             ▼
┌─────────────────────────────────┐
│      Backend API (.NET 8)       │
│                                 │
│  ┌──────────────────────────┐   │
│  │ Architecture:            │   │
│  │ - Clean Architecture     │   │
│  │ - CQRS (MediatR)         │   │
│  │ - Domain-Driven Design   │   │
│  └──────────────────────────┘   │
│                                 │
│  Features:                      │
│  - JWT Authentication           │
│  - SignalR (WebSockets)         │
│  - Email Service                │
│  - File Storage                 │
│  - Entity Framework Core        │
│                                 │
│  Deployment:                    │
│  - 2 replicas                   │
│  - Rolling updates              │
│  - NodePort: 30080              │
└────────────┬────────────────────┘
             │
             │ EF Core
             ▼
┌─────────────────────────────────┐
│      Database                   │
│      (PostgreSQL)               │
│                                 │
│  - Persistent Volume            │
│  - StatefulSet                  │
└─────────────────────────────────┘
```

## Component Details

### API Gateway (YARP)
**Technology**: .NET 8, YARP (Yet Another Reverse Proxy)

**High Availability:**
- Min Replicas: 3
- Max Replicas: 10 (HPA)
- Auto-scaling triggers:
  - CPU > 70%
  - Memory > 80%

**Resilience:**
- Circuit Breaker (Polly)
  - Failure threshold: 50%
  - Break duration: 30s
- Rate Limiting
  - 100 req/min per IP
  - Fixed window
- Pod Disruption Budget
  - Min available: 2

**Observability:**
- Prometheus metrics: `/metrics`
- OpenTelemetry tracing
- Structured logging

### Backend API
**Technology**: .NET 8, ASP.NET Core, Entity Framework Core

**Architecture Layers:**
- Domain (Entities, Value Objects)
- Application (Use Cases, Services)
- Infrastructure (External Services)
- Persistence (Database)
- Presentation (Controllers, DTOs)

**Features:**
- CQRS with MediatR
- JWT Authentication
- SignalR for real-time
- Email notifications
- File storage

### Frontend
**Technology**: React 18, TypeScript, Vite, Tailwind CSS

**Features:**
- SPA (Single Page Application)
- React Router
- Axios for API calls
- Responsive design

## Data Flow

### API Request Flow
```
1. User Request
   ↓
2. Ingress Controller
   ↓
3. API Gateway
   - Rate limiting check
   - Circuit breaker check
   - Load balancing
   - Request transformation
   ↓
4. Backend API
   - Authentication
   - Authorization
   - Business logic
   - Database operations
   ↓
5. Database (PostgreSQL)
   ↓
6. Response through Gateway
   - Response transformation
   - Metrics collection
   ↓
7. User receives response
```

### WebSocket (SignalR) Flow
```
1. Client connects to /hubs/*
   ↓
2. Ingress forwards to Gateway
   ↓
3. Gateway proxies WebSocket
   ↓
4. Backend API SignalR Hub
   ↓
5. Bidirectional real-time communication
```

## Scaling Strategy

### Horizontal Pod Autoscaler (HPA)

**Gateway:**
```yaml
Min: 3 replicas
Max: 10 replicas
Target CPU: 70%
Target Memory: 80%

Scale Up Policy:
  - Max 4 pods or 100% every 30s
  
Scale Down Policy:
  - Max 2 pods or 50% every 60s
  - Stabilization: 5 minutes
```

**Backend API:**
```yaml
Fixed: 2 replicas
Can be scaled manually
```

## High Availability Features

### Pod Distribution
```
Node 1:                    Node 2:                    Node 3:
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│ Gateway Pod 1│          │ Gateway Pod 2│          │ Gateway Pod 3│
│              │          │              │          │              │
│ Backend Pod 1│          │ Backend Pod 2│          │              │
└──────────────┘          └──────────────┘          └──────────────┘

Pod Anti-Affinity ensures pods spread across nodes
```

### Rolling Update Strategy
```
Current: 3 replicas
During update:
  - MaxSurge: 1 (can have 4 pods temporarily)
  - MaxUnavailable: 0 (no downtime)
  
Timeline:
1. Create new pod (v2) → 4 pods running
2. Wait for readiness
3. Remove old pod (v1) → 3 pods running
4. Repeat until all updated
```

### Pod Disruption Budget
```
Min Available: 2 pods

During node maintenance:
- Kubernetes ensures 2+ gateway pods always running
- Prevents draining nodes if would violate PDB
```

## Security Layers

```
┌─────────────────────────────────────────┐
│ 1. Ingress                              │
│    - TLS termination                    │
│    - SSL certificates                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 2. API Gateway                          │
│    - Rate limiting (DDoS protection)    │
│    - Security headers                   │
│    - CORS policies                      │
│    - Request validation                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 3. Backend API                          │
│    - JWT authentication                 │
│    - Authorization policies             │
│    - Input validation                   │
│    - Business logic security            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 4. Database                             │
│    - Connection security                │
│    - Encrypted storage                  │
│    - Access controls                    │
└─────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌────────────────────────────────────────────┐
│           Prometheus                       │
│                                            │
│  Scrapes metrics from:                     │
│  - Gateway (/metrics endpoint)             │
│  - Backend API                             │
│  - Kubernetes metrics                      │
└──────────────┬─────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│           Grafana                          │
│                                            │
│  Dashboards:                               │
│  - Request rates                           │
│  - Latency percentiles                     │
│  - Error rates                             │
│  - Resource usage                          │
│  - HPA scaling events                      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│       OpenTelemetry Collector              │
│                                            │
│  Distributed Tracing:                      │
│  - Request flow tracking                   │
│  - Service dependencies                    │
│  - Performance bottlenecks                 │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│       Logging (ELK/Loki)                   │
│                                            │
│  Centralized logs:                         │
│  - Application logs                        │
│  - Access logs                             │
│  - Error logs                              │
│  - Audit logs                              │
└────────────────────────────────────────────┘
```

## Network Policies (Optional)

```
┌─────────────────────────────────────────────┐
│  Network Policy: ingress-to-gateway         │
│  Allow: Ingress → Gateway (port 8080)       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Network Policy: gateway-to-backend         │
│  Allow: Gateway → Backend API (port 8080)   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Network Policy: backend-to-database        │
│  Allow: Backend → Database (port 5432)      │
└─────────────────────────────────────────────┘
```

## Resource Allocation

```
Gateway (per pod):
├── Requests:
│   ├── CPU: 100m
│   └── Memory: 128Mi
└── Limits:
    ├── CPU: 500m
    └── Memory: 512Mi

Backend API (per pod):
├── Requests:
│   ├── CPU: 250m
│   └── Memory: 256Mi
└── Limits:
    ├── CPU: 1000m
    └── Memory: 1Gi

Frontend (per pod):
├── Requests:
│   ├── CPU: 50m
│   └── Memory: 64Mi
└── Limits:
    ├── CPU: 200m
    └── Memory: 256Mi
```

## Failure Scenarios & Recovery

### Scenario 1: Gateway Pod Crash
```
1. Pod crashes
   ↓
2. Liveness probe fails
   ↓
3. Kubernetes restarts pod
   ↓
4. Readiness probe succeeds
   ↓
5. Pod added back to service
   ↓
Impact: Minimal (other 2+ pods handle traffic)
```

### Scenario 2: Backend API Overload
```
1. High traffic to backend
   ↓
2. Response time increases
   ↓
3. Circuit breaker activates
   ↓
4. Gateway returns 503 temporarily
   ↓
5. Backend recovers
   ↓
6. Circuit breaker closes
   ↓
Impact: Temporary degradation, prevents total failure
```

### Scenario 3: Node Failure
```
1. Node fails
   ↓
2. Pods on node become unavailable
   ↓
3. Kubernetes reschedules pods to healthy nodes
   ↓
4. PDB ensures min 2 gateway pods always available
   ↓
Impact: Brief capacity reduction, no total outage
```

### Scenario 4: Database Connection Lost
```
1. Database connection fails
   ↓
2. Backend API returns errors
   ↓
3. Gateway circuit breaker activates
   ↓
4. Gateway returns 503
   ↓
5. Database reconnects
   ↓
6. Circuit breaker resets
   ↓
Impact: Temporary service unavailability with fast recovery
```

## Deployment Environments

### Development (Minikube)
- Gateway: 3 replicas
- Backend: 2 replicas
- NodePort services
- Ingress for local testing

### Staging
- Gateway: 3-5 replicas
- Backend: 2-3 replicas
- LoadBalancer services
- Ingress with TLS

### Production
- Gateway: 5-10 replicas
- Backend: 3-5 replicas
- LoadBalancer with external IP
- Ingress with TLS, CDN
- Multiple availability zones
- Persistent storage with backups
