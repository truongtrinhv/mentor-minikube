# RabbitMQ Integration Guide - MentorPlatform

## Overview

This document provides a comprehensive guide to the RabbitMQ integration in MentorPlatform. The system uses RabbitMQ as a message broker to implement:

- **Event-Driven Architecture**: Domain events are published and consumed asynchronously
- **Saga Orchestration**: Complex, multi-step business processes managed via state machines
- **Loose Coupling**: Services communicate through messages rather than direct calls
- **Scalability**: Processing can be distributed across multiple instances

## Architecture

### Technology Stack

- **Message Broker**: RabbitMQ 3.13 (Management UI included)
- **Framework**: MassTransit 8.3.4 (Event Bus & Saga Orchestration)
- **Transport**: AMQP (RabbitMQ native protocol)
- **Patterns**: Saga Orchestration, Event Sourcing, CQRS

### Domain Events

#### Mentoring Session Events

```
MentoringSessionCreatedEvent
├─ EventId: Guid
├─ SessionId: Guid
├─ LearnerId: Guid
├─ MentorId: Guid
├─ ScheduleId: Guid
├─ CourseId: Guid
├─ SessionType: int
└─ OccurredOn: DateTime

MentoringSessionStatusChangedEvent
├─ SessionId: Guid
├─ OldStatus: int
├─ NewStatus: int
├─ LearnerId: Guid
└─ MentorId: Guid

MentoringSessionCompletedEvent
├─ SessionId: Guid
├─ LearnerId: Guid
├─ MentorId: Guid
└─ CompletedAt: DateTime

MentoringSessionCancelledEvent
├─ SessionId: Guid
├─ LearnerId: Guid
├─ MentorId: Guid
└─ CancellationReason: string
```

#### Course Enrollment Events

```
CourseEnrolledEvent
├─ EnrollmentId: Guid
├─ UserId: Guid
├─ CourseId: Guid
└─ EnrolledAt: DateTime

EnrollmentConfirmedEvent
├─ EnrollmentId: Guid
├─ UserId: Guid
└─ CourseId: Guid

CourseCapacityExceededEvent
├─ CourseId: Guid
├─ CurrentEnrollment: int
└─ MaxCapacity: int

CourseAccessGrantedEvent
├─ UserId: Guid
├─ CourseId: Guid
└─ GrantedAt: DateTime
```

#### Application Request Events

```
ApplicationRequestSubmittedEvent
├─ RequestId: Guid
├─ UserId: Guid
└─ SubmittedAt: DateTime

ApplicationRequestStatusChangedEvent
├─ RequestId: Guid
├─ UserId: Guid
├─ OldStatus: int
├─ NewStatus: int
└─ Reason: string

DocumentsValidatedEvent
├─ RequestId: Guid
├─ IsValid: bool
└─ ValidationMessage: string

BackgroundCheckCompletedEvent
├─ RequestId: Guid
├─ Passed: bool
└─ CheckDetails: string

ReviewerAssignedEvent
├─ RequestId: Guid
├─ ReviewerId: Guid
└─ AssignedAt: DateTime

ApplicationApprovedEvent
├─ RequestId: Guid
├─ UserId: Guid
├─ ApprovedAt: DateTime
└─ ApprovedBy: Guid

ApplicationRejectedEvent
├─ RequestId: Guid
├─ UserId: Guid
├─ RejectedAt: DateTime
├─ RejectedBy: Guid
└─ RejectionReason: string
```

## Saga Orchestration

### Mentoring Session Saga

**Flow**:
```
SessionCreated 
  ↓
ValidatingSchedule 
  ↓
ScheduleValidated 
  ↓
SendingNotifications 
  ↓
SessionScheduled (final)
```

**Consumers**:
- `ValidateScheduleConsumer`: Validates mentor availability
- `SendSessionNotificationsConsumer`: Sends notifications to participants

### Course Enrollment Saga

**Flow**:
```
EnrollmentInitiated 
  ↓
CheckingCapacity 
  ↓
CapacityConfirmed 
  ↓
ConfirmingEnrollment 
  ↓
EnrollmentConfirmed 
  ↓
SendingWelcomeEmail 
  ↓
GrantingAccess 
  ↓
EnrollmentCompleted (final)
```

**Consumers**:
- `CheckCourseCapacityConsumer`: Verifies course has available seats
- `ConfirmEnrollmentConsumer`: Confirms user enrollment
- `SendWelcomeEmailConsumer`: Sends welcome email
- `GrantCourseAccessConsumer`: Grants course access permissions

### Application Request Saga

**Flow**:
```
ApplicationSubmitted 
  ↓
ValidatingDocuments 
  ↓
DocumentsValidated 
  ↓
RequestingBackgroundCheck 
  ↓
BackgroundCheckCompleted 
  ↓
AssigningReviewer 
  ↓
UnderReview 
  ↓ (Approval or Rejection)
SendingNotification 
  ↓
ApplicationCompleted (final)
```

**Consumers**:
- `ValidateDocumentsConsumer`: Verifies all required documents are present
- `RequestBackgroundCheckConsumer`: Initiates background check
- `AssignReviewerConsumer`: Assigns application to reviewer
- `SendApplicationNotificationConsumer`: Notifies user of decision

## Configuration

### appsettings.json

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

### Environment Variables (Kubernetes)

```yaml
RabbitMQ__Host: "rabbitmq"
RabbitMQ__Port: "5672"
RabbitMQ__VirtualHost: "/"
RabbitMQ__Username: "guest"
RabbitMQ__Password: "guest"
RabbitMQ__PrefetchCount: "16"
RabbitMQ__UseSsl: "false"
RabbitMQ__Heartbeat: "60"
RabbitMQ__RetryLimit: "3"
RabbitMQ__RetryIntervalSeconds: "1"
```

## Local Development Setup

### 1. Start RabbitMQ with Docker

```bash
# Start RabbitMQ container
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=guest \
  -e RABBITMQ_DEFAULT_PASS=guest \
  rabbitmq:3.13-management-alpine

# Verify RabbitMQ is running
docker ps | grep rabbitmq
```

### 2. Access RabbitMQ Management UI

- **URL**: http://localhost:15672
- **Username**: guest
- **Password**: guest

### 3. Run the Backend

```bash
cd be/src/MentorPlatform.API
dotnet run
```

## Kubernetes Deployment

### 1. Deploy RabbitMQ

```bash
# Navigate to k8s directory
cd be/src/MentorPlatform.API/k8s

# Apply RabbitMQ manifests
kubectl apply -f rabbitmq.yaml

# Verify RabbitMQ deployment
kubectl get pods -n mentorplatform -l app=rabbitmq
kubectl get svc -n mentorplatform rabbitmq
```

### 2. Access RabbitMQ Management UI

```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# Access management UI
echo "RabbitMQ Management: http://${MINIKUBE_IP}:31672"
```

### 3. Port Forward for Development

```bash
# Forward management port for local access
kubectl port-forward -n mentorplatform svc/rabbitmq 15672:15672

# Forward AMQP port for local client connections
kubectl port-forward -n mentorplatform svc/rabbitmq 5672:5672
```

### 4. Update ConfigMap for Custom Settings

Edit `k8s/rabbitmq.yaml` and modify the `rabbitmq-config` ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: rabbitmq-config
  namespace: mentorplatform
data:
  rabbitmq.conf: |
    # Your custom configuration
    vm_memory_high_watermark.relative = 0.6
    channel_max = 1024
    heartbeat = 60
```

Then apply changes:

```bash
kubectl apply -f k8s/rabbitmq.yaml
```

## Publishing Domain Events

### In Services/Use Cases

```csharp
public class MentoringSessionServices
{
    private readonly IDomainEventDispatcher _eventDispatcher;
    
    public MentoringSessionServices(IDomainEventDispatcher eventDispatcher)
    {
        _eventDispatcher = eventDispatcher;
    }
    
    public async Task CreateSessionAsync(CreateSessionRequest request)
    {
        // ... business logic to create session ...
        
        var domainEvent = new MentoringSessionCreatedEvent
        {
            SessionId = session.Id,
            LearnerId = session.LearnerId,
            MentorId = session.MentorId,
            ScheduleId = session.ScheduleId,
            CourseId = session.CourseId,
            SessionType = (int)session.SessionType
        };
        
        // Publish event to RabbitMQ
        await _eventDispatcher.DispatchAsync(domainEvent);
    }
}
```

### With Aggregate Root

```csharp
// Entities can raise domain events
public class MentoringSession : AggregateRoot
{
    public void Create(Guid learnerId, Guid mentorId, ...)
    {
        // ... create logic ...
        
        // Add domain event
        AddDomainEvent(new MentoringSessionCreatedEvent
        {
            SessionId = this.Id,
            LearnerId = learnerId,
            MentorId = mentorId,
            // ...
        });
    }
}

// After saving entity, dispatch events
var session = new MentoringSession();
session.Create(...);
await _repository.AddAsync(session);
await _unitOfWork.SaveChangesAsync();

// Dispatch all domain events
await _eventDispatcher.DispatchAsync(session.DomainEvents);
session.ClearDomainEvents();
```

## Message Retry and Error Handling

### Retry Policy

The system implements an incremental retry policy:
- **Initial Retry**: 1 second delay
- **Max Retries**: 3 attempts
- **Delay Increment**: +2 seconds per retry
- **Total Max Delay**: 1s → 3s → 5s

### Dead Letter Handling

Failed messages are redelivered with exponential backoff:
- 1st redelivery: 1 minute
- 2nd redelivery: 5 minutes
- 3rd redelivery: 15 minutes

### Monitoring Failures

Check RabbitMQ Management UI for:
- Dead letter exchanges (DLX)
- Unacked messages
- Connection health
- Queue depths

## Performance Tuning

### RabbitMQ Configuration

```yaml
# Prefetch count - number of messages consumer accepts without acknowledging
PrefetchCount: 16  # Tune based on message processing time

# Heartbeat - TCP heartbeat interval in seconds
Heartbeat: 60  # Adjust for network conditions

# Memory threshold - when RabbitMQ stops accepting new messages
vm_memory_high_watermark.relative: 0.6  # 60% of available memory

# Channel limit
channel_max: 1024  # Max channels per connection
```

### Scaling Considerations

- **Multiple Consumers**: Deploy multiple API instances for parallel processing
- **Multiple Queues**: Separate queues for different event types
- **Persistent Storage**: Use StatefulSet with PersistentVolume for durability
- **Monitoring**: Use Prometheus metrics exposed on port 15692

## Troubleshooting

### RabbitMQ Connection Issues

```bash
# Test AMQP connection
kubectl exec -it rabbitmq-0 -n mentorplatform -- \
  rabbitmq-diagnostics ping

# Check RabbitMQ logs
kubectl logs -n mentorplatform rabbitmq-0

# Check service status
kubectl get svc -n mentorplatform rabbitmq
```

### Message Stuck in Queue

```bash
# List queues
kubectl exec -it rabbitmq-0 -n mentorplatform -- \
  rabbitmqctl list_queues

# Purge specific queue (use with caution)
kubectl exec -it rabbitmq-0 -n mentorplatform -- \
  rabbitmqctl purge_queue queue_name
```

### Reset RabbitMQ

```bash
# Delete RabbitMQ StatefulSet (persists data)
kubectl delete statefulset rabbitmq -n mentorplatform

# Delete PersistentVolumeClaim to start fresh
kubectl delete pvc rabbitmq-data-rabbitmq-0 -n mentorplatform

# Redeploy
kubectl apply -f k8s/rabbitmq.yaml
```

## Security Best Practices

### Credentials Management

```bash
# Create Kubernetes secret for RabbitMQ credentials
kubectl create secret generic rabbitmq-credentials \
  --from-literal=username=guest \
  --from-literal=password=secure-password \
  -n mentorplatform

# Reference in ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: rabbitmq-env
data:
  RABBITMQ_USER: $(RABBITMQ_USERNAME)
  RABBITMQ_PASS: $(RABBITMQ_PASSWORD)
```

### Enable SSL/TLS

```json
{
  "RabbitMQ": {
    "UseSsl": true,
    "Host": "rabbitmq.mentorplatform.svc.cluster.local"
  }
}
```

### Virtual Hosts

Create separate virtual hosts for different environments:

```bash
kubectl exec -it rabbitmq-0 -n mentorplatform -- \
  rabbitmqctl add_vhost development

kubectl exec -it rabbitmq-0 -n mentorplatform -- \
  rabbitmqctl set_permissions -p development guest ".*" ".*" ".*"
```

## Monitoring and Observability

### Metrics Collection

RabbitMQ exposes Prometheus metrics on port `15692`:

```bash
# Port forward metrics
kubectl port-forward -n mentorplatform svc/rabbitmq 15692:15692

# Access metrics
curl http://localhost:15692/metrics
```

### Key Metrics to Monitor

- `rabbitmq_queue_messages_ready`: Messages ready for delivery
- `rabbitmq_queue_messages_unacked`: Unacknowledged messages
- `rabbitmq_connections_total`: Active connections
- `rabbitmq_channels_total`: Active channels
- `rabbitmq_disk_space_available_bytes`: Available disk space

### Log Aggregation

Configure container logs for:
- `INFO`: Normal operations
- `WARNING`: Potential issues
- `ERROR`: Failed messages

## Maintenance

### Regular Tasks

1. **Monitor Queue Depths**: Check for message backlogs
2. **Review Failed Messages**: Check dead letter exchanges
3. **Monitor Memory Usage**: Ensure sufficient resources
4. **Backup Data**: Regular PersistentVolume snapshots
5. **Update RabbitMQ**: Regular security patches

### Cleanup

```bash
# Remove unused exchanges
kubectl exec -it rabbitmq-0 -n mentorplatform -- \
  rabbitmqctl delete_exchange exchange_name

# Remove unused queues
kubectl exec -it rabbitmq-0 -n mentorplatform -- \
  rabbitmqctl delete_queue queue_name
```

## References

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [MassTransit Documentation](https://masstransit.io/)
- [MassTransit Saga Pattern](https://masstransit.io/documentation/patterns/saga)
- [AMQP 0-9-1 Protocol](https://www.rabbitmq.com/protocol.html)
