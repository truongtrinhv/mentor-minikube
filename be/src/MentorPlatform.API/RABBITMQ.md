# RabbitMQ Integration for MentorPlatform

This document describes the RabbitMQ integration implemented for saga orchestration and domain events in the MentorPlatform backend.

## Architecture Overview

### Technology Stack
- **Message Broker**: RabbitMQ 3.13 (Management Alpine)
- **Framework**: MassTransit 8.3.4
- **Transport**: AMQP (RabbitMQ)
- **Pattern**: Saga Orchestration & Domain Events

### Use Cases

1. **Saga Orchestration** (via RabbitMQ)
   - Mentoring Session Workflow
   - Course Enrollment Workflow  
   - Application Request Workflow

2. **Domain Events** (via RabbitMQ)
   - Real-time event publishing
   - Cross-service communication
   - Event-driven workflows

## Implementation Components

### 1. Domain Events Layer (`Domain/Primitives` & `Domain/Events`)

**Base Interfaces & Classes:**
- `IDomainEvent` - Marker interface for domain events
- `DomainEvent` - Base class with EventId, OccurredOn, EventType
- `IHasDomainEvents` - Interface for aggregates that raise events
- `AggregateRoot` - Base aggregate with domain event collection

**Domain Events:**
- `MentoringSessionCreatedEvent`
- `MentoringSessionStatusChangedEvent`
- `CourseEnrolledEvent`
- `ApplicationRequestSubmittedEvent`
- `ApplicationRequestStatusChangedEvent`
- `UserCreatedEvent`

### 2. Saga State Machines (`Application/Sagas`)

#### Mentoring Session Saga
**States:**
- SessionCreated → ValidatingSchedule → ScheduleValidated → SendingNotifications → SessionScheduled
- SessionCancelled, SessionCompleted (final states)

**Commands:**
- `ValidateScheduleCommand`
- `SendSessionNotificationsCommand`

**Events:**
- `ScheduleValidatedEvent`
- `NotificationsSentEvent`

#### Course Enrollment Saga
**States:**
- EnrollmentInitiated → CheckingCapacity → CapacityConfirmed → ConfirmingEnrollment → EnrollmentConfirmed → SendingWelcomeEmail → GrantingAccess → EnrollmentCompleted

**Commands:**
- `CheckCourseCapacityCommand`
- `ConfirmEnrollmentCommand`
- `SendWelcomeEmailCommand`
- `GrantCourseAccessCommand`

**Events:**
- `CourseCapacityCheckedEvent`
- `EnrollmentConfirmedEvent`
- `WelcomeEmailSentEvent`
- `CourseAccessGrantedEvent`

#### Application Request Saga
**States:**
- ApplicationSubmitted → ValidatingDocuments → DocumentsValidated → RequestingBackgroundCheck → BackgroundCheckCompleted → AssigningReviewer → UnderReview → ApplicationApproved/Rejected → SendingNotification → ApplicationCompleted

**Commands:**
- `ValidateDocumentsCommand`
- `RequestBackgroundCheckCommand`
- `AssignReviewerCommand`
- `SendApplicationNotificationCommand`

**Events:**
- `DocumentsValidatedEvent`
- `BackgroundCheckCompletedEvent`
- `ReviewerAssignedEvent`
- `NotificationSentEvent`

### 3. Infrastructure Layer (`Infrastructure/Extensions`)

**RabbitMQExtensions.cs:**
- `AddRabbitMQMessageBus()` - Configures MassTransit with RabbitMQ
- `AddDomainEventDispatcher()` - Registers domain event dispatcher
- `IDomainEventDispatcher` - Interface for publishing domain events
- `DomainEventDispatcher` - Implementation using MassTransit PublishEndpoint

**Configuration (`Infrastructure/Messaging/Configuration`):**
- `RabbitMQOptions` - RabbitMQ connection settings

### 4. Configuration

**appsettings.json:**
```json
{
  "RabbitMQ": {
    "Host": "localhost",
    "Port": 5672,
    "VirtualHost": "/",
    "Username": "guest",
    "Password": "guest",
    "PrefetchCount": 16,
    "UseSsl": false
  }
}
```

**Kubernetes ConfigMap:**
```yaml
RabbitMQ__Host: "rabbitmq"
RabbitMQ__Port: "5672"
RabbitMQ__VirtualHost: "/"
RabbitMQ__Username: "guest"
RabbitMQ__Password: "guest"
RabbitMQ__PrefetchCount: "16"
RabbitMQ__UseSsl: "false"
```

## Deployment

### Local Development

1. **Start RabbitMQ with Docker:**
```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=guest \
  -e RABBITMQ_DEFAULT_PASS=guest \
  rabbitmq:3.13-management-alpine
```

2. **Access RabbitMQ Management UI:**
- URL: http://localhost:15672
- Username: guest
- Password: guest

### Kubernetes Deployment

1. **Apply RabbitMQ manifest:**
```bash
kubectl apply -f be/src/MentorPlatform.API/k8s/rabbitmq.yaml
```

2. **Verify deployment:**
```bash
kubectl get pods -n mentorplatform -l app=rabbitmq
kubectl get svc -n mentorplatform rabbitmq
```

3. **Access RabbitMQ Management (NodePort):**
```bash
# Get Minikube IP
minikube ip

# Access management UI at: http://<minikube-ip>:31672
```

4. **Port-forward for local access:**
```bash
kubectl port-forward -n mentorplatform svc/rabbitmq 15672:15672
```

## Usage Examples

### Publishing Domain Events

```csharp
// In your service or use case
public class MentoringSessionServices
{
    private readonly IDomainEventDispatcher _eventDispatcher;
    
    public async Task CreateSessionAsync(CreateSessionRequest request)
    {
        // ... create session logic
        
        var domainEvent = new MentoringSessionCreatedEvent
        {
            SessionId = session.Id,
            LearnerId = session.LearnerId,
            ScheduleId = session.ScheduleId,
            CourseId = session.CourseId,
            SessionType = (int)session.SessionType
        };
        
        await _eventDispatcher.DispatchAsync(domainEvent);
    }
}
```

### Using Aggregate Roots

```csharp
// In your domain entity
public class MentoringSession : AggregateRoot, IHasKey<Guid>
{
    public void Complete()
    {
        Status = SessionStatus.Completed;
        
        AddDomainEvent(new MentoringSessionStatusChangedEvent
        {
            SessionId = Id,
            OldStatus = (int)SessionStatus.Scheduled,
            NewStatus = (int)SessionStatus.Completed,
            ChangedBy = ModifiedBy ?? CreatedBy
        });
    }
}

// In your repository/unit of work
public class UnitOfWork
{
    public async Task<int> SaveChangesAsync()
    {
        var entities = _dbContext.ChangeTracker
            .Entries<AggregateRoot>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();
        
        var result = await _dbContext.SaveChangesAsync();
        
        foreach (var entity in entities)
        {
            await _eventDispatcher.DispatchAsync(entity.DomainEvents);
            entity.ClearDomainEvents();
        }
        
        return result;
    }
}
```

## Message Flow

### Saga Orchestration Flow

1. **Domain Event Published** → RabbitMQ Exchange
2. **Saga Consumes Event** → State Machine Transition
3. **Saga Publishes Command** → RabbitMQ Exchange  
4. **Consumer Handles Command** → Executes Business Logic
5. **Consumer Publishes Event** → RabbitMQ Exchange
6. **Saga Consumes Event** → Next State Transition
7. **Repeat** until saga completes or fails

### Message Patterns

- **Publish/Subscribe**: Domain events broadcast to multiple consumers
- **Request/Response**: Commands with correlation IDs
- **Saga Orchestration**: State machine coordination
- **Dead Letter Queue**: Failed messages for manual intervention
- **Delayed Retry**: Exponential backoff (1s, 5s, 15s intervals)

## Monitoring & Debugging

### RabbitMQ Management UI

**Key Metrics to Monitor:**
- Queue depth and consumer count
- Message rates (publish/consume)
- Connection and channel status
- Memory and disk usage

**Queues Created by MassTransit:**
- `mentoringsession-state` - Saga state machine queue
- `courseenrollment-state` - Saga state machine queue
- `applicationrequest-state` - Saga state machine queue
- Event consumer queues (auto-generated)

### Logging

All saga transitions and domain event dispatches are logged:
```csharp
_logger.LogInformation(
    "Domain event {EventType} (ID: {EventId}) published to RabbitMQ", 
    domainEvent.EventType, 
    domainEvent.EventId);
```

## Configuration Options

### Retry Policy
```csharp
cfg.UseMessageRetry(r => r.Incremental(
    retryLimit: 3, 
    initialInterval: TimeSpan.FromSeconds(1), 
    intervalIncrement: TimeSpan.FromSeconds(2)));
```

### Delayed Redelivery
```csharp
cfg.UseDelayedRedelivery(r => r.Intervals(
    TimeSpan.FromMinutes(1),
    TimeSpan.FromMinutes(5),
    TimeSpan.FromMinutes(15)));
```

### Prefetch Count
Controls concurrent message processing:
```json
"PrefetchCount": 16
```

## Production Considerations

### Persistence
- Current implementation uses **InMemoryRepository** for sagas
- **Recommended**: Switch to EF Core saga repository for production
```csharp
x.AddSagaStateMachine<MentoringSessionStateMachine, MentoringSessionSagaState>()
    .EntityFrameworkRepository(r => r.AddDbContext<DbContext, SagaDbContext>());
```

### High Availability
- Deploy RabbitMQ cluster (3+ nodes)
- Use persistent volumes for data
- Configure queue mirroring/quorum queues

### Security
- Change default credentials
- Enable TLS/SSL
- Use separate users per service
- Network policies for pod-to-pod communication

### Scalability
- Horizontal scaling of API pods (saga consumers scale automatically)
- Increase prefetch count for higher throughput
- Monitor queue depths and adjust consumers

## Troubleshooting

### Common Issues

**1. Connection Refused:**
```
Check RabbitMQ is running: kubectl get pods -n mentorplatform
Check service exists: kubectl get svc -n mentorplatform rabbitmq
Verify connection string in ConfigMap
```

**2. Messages Not Consumed:**
```
Check consumer is registered
Verify queue bindings in RabbitMQ UI
Check application logs for exceptions
```

**3. Saga State Not Persisting:**
```
Saga uses InMemoryRepository (data lost on restart)
Implement EF Core repository for production
```

## Next Steps

1. **Implement Saga Persistence** - Add EF Core repository
2. **Add Consumer Implementations** - Handle saga commands
3. **Integrate with Existing Services** - Publish domain events from use cases
4. **Add Monitoring** - Integrate with Application Insights/Prometheus
5. **Performance Testing** - Load test saga workflows
6. **Documentation** - Add OpenAPI docs for async workflows
