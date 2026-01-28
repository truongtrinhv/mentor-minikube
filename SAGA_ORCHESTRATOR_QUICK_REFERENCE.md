# Saga Orchestrator - Quick Reference

## Quick Start

### 1. Publishing Domain Events from Services

```csharp
// Inject IDomainEventDispatcher
private readonly IDomainEventDispatcher _eventDispatcher;

// Publish event after entity creation
await _eventDispatcher.DispatchAsync(new MentoringSessionCreatedEvent
{
    SessionId = session.Id,
    LearnerId = userId,
    MentorId = mentorId,
    ScheduleId = scheduleId,
    CourseId = courseId,
    SessionType = (int)session.SessionType,
    OccurredOn = DateTime.UtcNow
});
```

### 2. Creating a Saga State Machine

```csharp
public class MySagaStateMachine : MassTransitStateMachine<MySagaState>
{
    // Define states
    public State CreatedState { get; set; }
    public State ProcessingState { get; set; }
    public State CompletedState { get; set; }
    
    // Define events
    public Event<MyCreatedEvent> CreationEvent { get; set; }
    public Event<MyProcessedEvent> ProcessingEvent { get; set; }
    
    public MySagaStateMachine()
    {
        InstanceState(x => x.CurrentState);
        
        // Initial state
        Initially(
            When(CreationEvent)
                .Then(context => context.Saga.Id = context.Message.Id)
                .TransitionTo(ProcessingState)
                .Publish(context => new MyProcessCommand { Id = context.Saga.Id })
        );
        
        // Intermediate state
        During(ProcessingState,
            When(ProcessingEvent)
                .TransitionTo(CompletedState)
        );
        
        // Mark as completed for finalization
        SetCompletedWhenFinalized();
    }
}
```

### 3. Creating a Consumer

```csharp
public class MyCommandConsumer : IConsumer<MyProcessCommand>
{
    private readonly IMyService _service;
    private readonly ILogger<MyCommandConsumer> _logger;
    
    public MyCommandConsumer(IMyService service, ILogger<MyCommandConsumer> logger)
    {
        _service = service;
        _logger = logger;
    }
    
    public async Task Consume(ConsumeContext<MyProcessCommand> context)
    {
        var message = context.Message;
        
        try
        {
            _logger.LogInformation("Processing {Id}", message.Id);
            
            // Execute business logic
            var result = await _service.ProcessAsync(message.Id);
            
            // Publish event for saga continuation
            var completedEvent = new MyProcessedEvent
            {
                Id = message.Id,
                Result = result
            };
            
            await context.Publish(completedEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing {Id}", message.Id);
            throw; // MassTransit will retry
        }
    }
}
```

## Saga States Quick Reference

### Mentoring Session Saga
| State | Triggered By | Publishes | Next State |
|-------|--------------|-----------|-----------|
| SessionCreated | MentoringSessionCreatedEvent | ValidateScheduleCommand | ValidatingSchedule |
| ValidatingSchedule | ScheduleValidatedEvent | SendSessionNotificationsCommand | SendingNotifications |
| SendingNotifications | NotificationsSentEvent | - | SessionScheduled |
| SessionScheduled | - | - | (Final) |
| SessionCancelled | CancellationRequested | - | (Final) |

### Course Enrollment Saga
| State | Triggered By | Publishes | Next State |
|-------|--------------|-----------|-----------|
| EnrollmentInitiated | CourseEnrolledEvent | CheckCourseCapacityCommand | CheckingCapacity |
| CheckingCapacity | CourseCapacityCheckedEvent | ConfirmEnrollmentCommand | ConfirmingEnrollment |
| ConfirmingEnrollment | EnrollmentConfirmedEvent | SendWelcomeEmailCommand | SendingWelcomeEmail |
| SendingWelcomeEmail | WelcomeEmailSentEvent | GrantCourseAccessCommand | GrantingAccess |
| GrantingAccess | CourseAccessGrantedEvent | - | EnrollmentCompleted |
| EnrollmentFailed | (if no capacity) | - | (Final) |

### Application Request Saga
| State | Triggered By | Publishes | Next State |
|-------|--------------|-----------|-----------|
| ApplicationSubmitted | ApplicationRequestSubmittedEvent | ValidateDocumentsCommand | ValidatingDocuments |
| ValidatingDocuments | DocumentsValidatedEvent | RequestBackgroundCheckCommand | RequestingBackgroundCheck |
| RequestingBackgroundCheck | BackgroundCheckCompletedEvent | AssignReviewerCommand | AssigningReviewer |
| AssigningReviewer | ReviewerAssignedEvent | - | UnderReview |
| UnderReview | ApprovedEvent or RejectedEvent | SendApplicationNotificationCommand | SendingNotification |
| SendingNotification | - | - | ApplicationCompleted (Final) |

## File Locations

### Domain Events
- **Path:** `be/src/MentorPlatform.Domain/Events/`
- **Files:**
  - `MentoringSessionEvents.cs` - Session-related events
  - `CourseEvents.cs` - Enrollment-related events
  - `ApplicationRequestEvents.cs` - Application-related events

### Saga State Machines
- **Path:** `be/src/MentorPlatform.Application/Sagas/`
- **Folders:**
  - `MentoringSessionSaga/` - Session saga
  - `CourseEnrollmentSaga/` - Enrollment saga
  - `ApplicationRequestSaga/` - Application saga
  - `Common/` - Shared saga utilities

### Consumers
- **Path:** `be/src/MentorPlatform.Infrastructure/Messaging/Consumers/`
- **Files:**
  - `MentoringSessionConsumers.cs` - Session consumers
  - `CourseEnrollmentConsumers.cs` - Enrollment consumers
  - `ApplicationRequestConsumers.cs` - Application consumers
  - `SagaConsumerBase.cs` - Base class for consumers

### Configuration
- **Path:** `be/src/MentorPlatform.Infrastructure/Extensions/`
- **Files:**
  - `RabbitMQExtensions.cs` - Message bus configuration
  - `DependencyInjection.cs` - Service registration

### Use Cases (Event Publishing)
- **Path:** `be/src/MentorPlatform.Application/UseCases/`
- **Services:**
  - `MentoringSessionUseCases/MentoringSessionServices.cs`
  - `CourseUseCases/CourseServices.cs`
  - `ApplicationRequestUseCases/ApplicationRequestServices.cs`

## Common Patterns

### Pattern 1: Conditional Transitions
```csharp
When(ValidatedEvent)
    .IfElse(context => context.Message.IsValid,
        binder => binder.TransitionTo(SuccessState)
                        .Publish(context => new ContinueCommand { ... }),
        binder => binder.TransitionTo(FailureState))
```

### Pattern 2: Exception Handling
```csharp
try
{
    // Business logic
    await _service.DoSomethingAsync();
}
catch (NotFoundException ex)
{
    _logger.LogWarning(ex, "Resource not found");
    // Optionally publish failure event
    await context.Publish(new ProcessingFailedEvent { Message = ex.Message });
}
catch (Exception ex)
{
    _logger.LogError(ex, "Unexpected error");
    throw; // MassTransit will retry
}
```

### Pattern 3: Saga Data Persistence
```csharp
public class MySagaState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    public string CurrentState { get; set; }
    
    // Business data
    public Guid ResourceId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Tracking
    public int RetryCount { get; set; }
    public string? FailureReason { get; set; }
}
```

### Pattern 4: Event Correlation
```csharp
Event(() => MyEvent, x => x.CorrelateById(m => m.Message.ResourceId));
```

## Debugging Tips

### 1. Enable Verbose Logging
```csharp
// In appsettings.json
{
  "Logging": {
    "LogLevel": {
      "MassTransit": "Debug",
      "MentorPlatform.Infrastructure.Messaging": "Debug"
    }
  }
}
```

### 2. Monitor RabbitMQ Management UI
- URL: `http://localhost:15672` (default)
- Check: Queues, Exchanges, Connections
- Monitor: Message rates, consumer counts

### 3. Check Saga State
```csharp
// Query saga instance (if using EF Core persistence)
var sagaInstance = await dbContext.MentoringSessionSagaStates
    .FirstOrDefaultAsync(x => x.SessionId == sessionId);

Console.WriteLine($"State: {sagaInstance.CurrentState}");
Console.WriteLine($"Created: {sagaInstance.CreatedAt}");
Console.WriteLine($"RetryCount: {sagaInstance.RetryCount}");
```

### 4. Trace Message Flow
Look for these log patterns:
```
INFO: Domain event published: MentoringSessionCreated for SessionId {id}
INFO: Validating schedule {scheduleId} for session {sessionId}
INFO: Schedule validation completed for session {sessionId}, IsValid: {bool}
INFO: Sending notifications for session {sessionId}
INFO: Notifications event published for session {sessionId}
```

## Performance Considerations

### Consumer Throughput
- Default prefetch count: 10 messages
- Configurable in RabbitMQOptions
- Higher = more memory, lower = potential latency

### Saga State Storage
- In-memory (current): Fast but lost on restart
- EF Core (production): Persisted but slightly slower
- Choose based on recovery requirements

### Message Retention
- RabbitMQ default: Messages persist until acknowledged
- Dead letter queue: Failed messages after retries
- Configure TTL for old messages

## Troubleshooting

### Problem: Saga doesn't transition
**Check:**
1. Is event being published? Look for publish logs
2. Is saga registered? Check RabbitMQExtensions.cs
3. Is correlation correct? Verify CorrelateById logic
4. Is consumer running? Check consumer registration

### Problem: Messages stuck in queue
**Check:**
1. Consumer crashes? Look at error logs
2. Poison message? Check dead letter queue
3. RabbitMQ overload? Monitor connections/channels
4. Network issues? Check connection status

### Problem: Duplicate processing
**Solution:** Implement idempotency
```csharp
// Check if already processed
var existing = await _repository.FirstOrDefaultAsync(
    x => x.ExternalId == message.ExternalId && 
         x.ProcessedAt != null);

if (existing != null)
{
    _logger.LogInformation("Message already processed: {Id}", message.ExternalId);
    return;
}
```

## Next Steps

1. **Monitor Production:** Use APM tools (New Relic, DataDog, AppDynamics)
2. **Scale Consumers:** Increase consumer instances for higher throughput
3. **Implement Persistence:** Switch to EF Core saga repositories
4. **Add Compensation:** Implement rollback logic for failures
5. **Test Chaos:** Inject failures to test resilience
6. **Document Flows:** Create sequence diagrams for critical sagas

## Additional Resources

- [MassTransit Documentation](https://masstransit.io/)
- [Saga Pattern Guide](https://microservices.io/patterns/data/saga.html)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [MentorPlatform Architecture](./ARCHITECTURE.md)
- [RabbitMQ Integration Guide](./RABBITMQ_INTEGRATION_GUIDE.md)
