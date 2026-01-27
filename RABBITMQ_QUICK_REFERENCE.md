# RabbitMQ Quick Reference - MentorPlatform

## Quick Start (Local Development)

### 1. Start RabbitMQ
```bash
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=guest \
  -e RABBITMQ_DEFAULT_PASS=guest \
  rabbitmq:3.13-management-alpine
```

### 2. Access Management UI
```
URL: http://localhost:15672
Username: guest
Password: guest
```

### 3. Run Backend
```bash
cd be/src/MentorPlatform.API
dotnet run
```

## Quick Start (Kubernetes)

### 1. Deploy RabbitMQ
```bash
kubectl apply -f be/src/MentorPlatform.API/k8s/rabbitmq.yaml
```

### 2. Verify Deployment
```bash
kubectl get pods -n mentorplatform -l app=rabbitmq
kubectl get svc -n mentorplatform rabbitmq
```

### 3. Access Management UI
```bash
# Get IP and port
minikube ip  # e.g., 192.168.49.2
# Access: http://192.168.49.2:31672
```

### 4. Port Forward (Optional)
```bash
kubectl port-forward -n mentorplatform svc/rabbitmq 15672:15672 &
kubectl port-forward -n mentorplatform svc/rabbitmq 5672:5672 &
```

## File Structure

```
be/src/
├── MentorPlatform.API/
│   ├── appsettings.json               # RabbitMQ config
│   ├── RABBITMQ.md                    # Original docs
│   ├── k8s/
│   │   └── rabbitmq.yaml              # K8s manifests
│   └── RABBITMQ_INTEGRATION_GUIDE.md  # Full guide
│
├── MentorPlatform.Domain/
│   └── Primitives/
│       └── DomainEvents.cs            # Base event classes
│   └── Events/
│       ├── MentoringSessionEvents.cs
│       ├── CourseEvents.cs
│       └── ApplicationRequestEvents.cs
│
├── MentorPlatform.Application/
│   └── Sagas/
│       ├── MentoringSessionSaga/
│       │   └── MentoringSessionStateMachine.cs
│       ├── CourseEnrollmentSaga/
│       │   └── CourseEnrollmentStateMachine.cs
│       └── ApplicationRequestSaga/
│           └── ApplicationRequestStateMachine.cs
│
└── MentorPlatform.Infrastructure/
    ├── Extensions/
    │   ├── RabbitMQExtensions.cs      # MassTransit config
    │   └── DependencyInjection.cs     # DI integration
    └── Messaging/
        ├── Configuration/
        │   └── RabbitMQOptions.cs
        └── Consumers/
            ├── MentoringSessionConsumers.cs
            ├── CourseEnrollmentConsumers.cs
            └── ApplicationRequestConsumers.cs
```

## Configuration

### Local (appsettings.json)
```json
{
  "RabbitMQ": {
    "Host": "localhost",
    "Port": 5672,
    "VirtualHost": "/",
    "Username": "guest",
    "Password": "guest",
    "PrefetchCount": 16,
    "UseSsl": false,
    "Heartbeat": 60,
    "RetryLimit": 3,
    "RetryIntervalSeconds": 1
  }
}
```

### Kubernetes (Environment Variables)
```yaml
RabbitMQ__Host: "rabbitmq"
RabbitMQ__Port: "5672"
RabbitMQ__VirtualHost: "/"
RabbitMQ__Username: "guest"
RabbitMQ__Password: "guest"
```

## Publishing Events

### From Service
```csharp
public class MentoringSessionServices
{
    private readonly IDomainEventDispatcher _eventDispatcher;
    
    public async Task CreateSessionAsync(CreateSessionRequest request)
    {
        // Create session logic...
        
        var @event = new MentoringSessionCreatedEvent
        {
            SessionId = session.Id,
            LearnerId = session.LearnerId,
            MentorId = session.MentorId,
            ScheduleId = session.ScheduleId,
            CourseId = session.CourseId,
            SessionType = (int)session.SessionType
        };
        
        await _eventDispatcher.DispatchAsync(@event);
    }
}
```

## Event Types

### Mentoring Session
- `MentoringSessionCreatedEvent`
- `MentoringSessionStatusChangedEvent`
- `MentoringSessionCompletedEvent`
- `MentoringSessionCancelledEvent`

### Course Enrollment
- `CourseEnrolledEvent`
- `EnrollmentConfirmedEvent`
- `CourseCapacityExceededEvent`
- `CourseAccessGrantedEvent`

### Application Request
- `ApplicationRequestSubmittedEvent`
- `ApplicationRequestStatusChangedEvent`
- `DocumentsValidatedEvent`
- `BackgroundCheckCompletedEvent`
- `ReviewerAssignedEvent`
- `ApplicationApprovedEvent`
- `ApplicationRejectedEvent`

## Saga State Machines

### Mentoring Session Saga
```
SessionCreated → ValidatingSchedule → ScheduleValidated 
  → SendingNotifications → SessionScheduled
```

### Course Enrollment Saga
```
EnrollmentInitiated → CheckingCapacity → ConfirmingEnrollment 
  → SendingWelcomeEmail → GrantingAccess → EnrollmentCompleted
```

### Application Request Saga
```
ApplicationSubmitted → ValidatingDocuments → RequestingBackgroundCheck 
  → AssigningReviewer → UnderReview → (Approve/Reject) 
  → SendingNotification → ApplicationCompleted
```

## Troubleshooting

### Check RabbitMQ Status
```bash
# Docker
docker ps | grep rabbitmq
docker logs rabbitmq

# Kubernetes
kubectl get pods -n mentorplatform -l app=rabbitmq
kubectl logs -n mentorplatform rabbitmq-0
```

### Test Connection
```bash
# Kubernetes
kubectl exec -it rabbitmq-0 -n mentorplatform -- rabbitmq-diagnostics ping

# Docker
docker exec rabbitmq rabbitmq-diagnostics ping
```

### View Queues
```bash
# Kubernetes
kubectl exec -it rabbitmq-0 -n mentorplatform -- rabbitmqctl list_queues

# Docker
docker exec rabbitmq rabbitmqctl list_queues
```

### Reset RabbitMQ
```bash
# Kubernetes - stop/remove
kubectl delete statefulset rabbitmq -n mentorplatform
kubectl delete pvc rabbitmq-data-rabbitmq-0 -n mentorplatform
kubectl apply -f be/src/MentorPlatform.API/k8s/rabbitmq.yaml

# Docker - stop/remove
docker stop rabbitmq
docker rm rabbitmq
# Then restart with docker run command above
```

## Monitoring Endpoints

### Management UI
- **Local**: http://localhost:15672
- **Kubernetes**: http://{minikube_ip}:31672

### Metrics (Prometheus)
- **Local**: http://localhost:15692/metrics (port forward required)
- **Kubernetes**: Pod metrics on port 15692

## Environment Preparation

### Required Packages
Already added to `MentorPlatform.Infrastructure.csproj`:
- `MassTransit` v8.3.4
- `MassTransit.RabbitMQ` v8.3.4

### Dependencies
Installed via NuGet automatically:
- `RabbitMQ.Client`
- All MassTransit dependencies

## Deployment Checklist

- [ ] RabbitMQ pod is running
- [ ] Services are accessible (amqp, management)
- [ ] PersistentVolume is mounted
- [ ] ConfigMap is applied
- [ ] Backend pod can connect to RabbitMQ
- [ ] Test event publishing in logs
- [ ] Management UI is accessible
- [ ] Sagas are completing successfully

## Performance Tips

1. **Adjust PrefetchCount**: Lower for long-running tasks, higher for quick tasks
2. **Monitor Queue Depths**: Use RabbitMQ UI to identify bottlenecks
3. **Scale Consumers**: Deploy multiple backend instances for parallel processing
4. **Use Separate Queues**: Group related events to prevent starvation
5. **Enable Lazy Queues**: For large, infrequently accessed queues

## Next Steps

1. Read [RABBITMQ_INTEGRATION_GUIDE.md](../RABBITMQ_INTEGRATION_GUIDE.md) for detailed documentation
2. Integrate event publishing into application services
3. Implement event subscribers for business logic
4. Set up monitoring and alerting
5. Plan disaster recovery strategy
