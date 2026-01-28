# Saga Orchestrator - Full Implementation Guide

## Overview
The MentorPlatform backend implements comprehensive saga orchestration using MassTransit and RabbitMQ for managing complex, distributed business processes across multiple services.

## What is a Saga Orchestrator?

A Saga is a pattern for managing distributed transactions across multiple services. Instead of using traditional ACID transactions, sagas coordinate a series of local transactions across services. If a transaction fails, the saga triggers compensating transactions to undo changes.

**Key Characteristics:**
- Decoupled services communicating via events
- Long-running business processes
- Automatic compensation on failures
- Asynchronous execution
- Event-driven architecture

## Implemented Sagas

### 1. Mentoring Session Saga
**Purpose:** Orchestrates the mentoring session creation and scheduling workflow

**States:**
```
SessionCreated 
  ↓
ValidatingSchedule 
  ↓ (if valid)
SendingNotifications 
  ↓
SessionScheduled (final)
  ↓ (or CancellationRequested/SessionCompleted)
SessionCancelled/SessionCompleted (final)
```

**Flow:**
1. **MentoringSessionCreated Event** → Triggered when learner creates session request
   - Source: `MentoringSessionServices.CreateAsync()`
   - Data: SessionId, LearnerId, MentorId, ScheduleId, CourseId
   
2. **ValidateScheduleCommand** → Saga publishes command
   - Validates schedule availability and mentor capacity
   - Consumer: `ValidateScheduleConsumer`
   
3. **ScheduleValidatedEvent** → Saga receives validation result
   - Transitions to SendingNotifications state
   
4. **SendSessionNotificationsCommand** → Saga publishes command
   - Notifies mentor and learner about confirmed session
   - Consumer: `SendSessionNotificationsConsumer`
   
5. **NotificationsSentEvent** → Final event
   - Completes saga, session is now scheduled

**Database Integration:**
- Validates schedule exists using `IRepository<Schedule, Guid>`
- Checks schedule date is not in the past
- Confirms mentor-learner relationship through schedule

### 2. Course Enrollment Saga
**Purpose:** Manages complete course enrollment workflow with capacity checking

**States:**
```
EnrollmentInitiated
  ↓
CheckingCapacity
  ↓ (if capacity available)
ConfirmingEnrollment
  ↓
EnrollmentConfirmed
  ↓
SendingWelcomeEmail
  ↓
GrantingAccess
  ↓
EnrollmentCompleted (final)
  ↓ (if no capacity)
EnrollmentFailed (final)
```

**Flow:**
1. **CourseEnrolledEvent** → Triggered when user enrolls in course
   
2. **CheckCourseCapacityCommand** → Validates course has available slots
   - Consumer: `CheckCourseCapacityConsumer`
   - Returns: CourseCapacityCheckedEvent with HasCapacity flag
   
3. **ConfirmEnrollmentCommand** → Confirms enrollment in system
   - Consumer: `ConfirmEnrollmentConsumer`
   - Returns: EnrollmentConfirmedEvent
   
4. **SendWelcomeEmailCommand** → Sends welcome email to enrolled user
   - Consumer: `SendWelcomeEmailConsumer`
   - Returns: WelcomeEmailSentEvent
   
5. **GrantCourseAccessCommand** → Grants user access to course materials
   - Consumer: `GrantCourseAccessConsumer`
   - Returns: CourseAccessGrantedEvent
   
6. **Final State:** EnrollmentCompleted

### 3. Application Request Saga
**Purpose:** Orchestrates mentor application review process

**States:**
```
ApplicationSubmitted
  ↓
ValidatingDocuments
  ↓ (if valid)
RequestingBackgroundCheck
  ↓ (if passed)
AssigningReviewer
  ↓
UnderReview
  ↓ (Approval or Rejection)
SendingNotification
  ↓
ApplicationCompleted (final)
  ↓ (if documents invalid or check failed)
ApplicationRejected (final)
```

**Flow:**
1. **ApplicationRequestSubmittedEvent** → User submits mentor application
   - Source: `ApplicationRequestServices.CreateAsync()`
   
2. **ValidateDocumentsCommand** → Validates required documents
   - Consumer: `ValidateDocumentsConsumer`
   - Returns: DocumentsValidatedEvent
   
3. **RequestBackgroundCheckCommand** → Initiates background verification
   - Consumer: `RequestBackgroundCheckConsumer`
   - Returns: BackgroundCheckCompletedEvent
   
4. **AssignReviewerCommand** → Assigns appropriate reviewer
   - Consumer: `AssignReviewerConsumer`
   - Returns: ReviewerAssignedEvent
   
5. **Review Processing** → Reviewer approves or rejects
   - Application stays in UnderReview state
   - Triggered by ApplicationApprovedEvent or ApplicationRejectedEvent
   
6. **SendApplicationNotificationCommand** → Notifies applicant of decision
   - Consumer: `SendApplicationNotificationConsumer`
   
7. **Final State:** ApplicationCompleted

## Architecture Components

### 1. Domain Events (Domain/Events)
**Purpose:** Represent something that happened in the business domain

```csharp
public class MentoringSessionCreatedEvent : DomainEvent
{
    public Guid SessionId { get; set; }
    public Guid LearnerId { get; set; }
    public Guid MentorId { get; set; }
    public DateTime OccurredOn { get; set; }
}
```

**Key Events:**
- MentoringSessionCreatedEvent
- CourseEnrolledEvent
- ApplicationRequestSubmittedEvent
- ScheduleValidatedEvent
- DocumentsValidatedEvent
- BackgroundCheckCompletedEvent
- ReviewerAssignedEvent

### 2. Saga State Machines (Application/Sagas)
**Purpose:** Define state transitions and orchestration logic

```csharp
public class MentoringSessionStateMachine : MassTransitStateMachine<MentoringSessionSagaState>
{
    public State SessionCreated { get; private set; }
    public State ValidatingSchedule { get; private set; }
    public State SendingNotifications { get; private set; }
    public State SessionScheduled { get; private set; }
    
    public MentoringSessionStateMachine()
    {
        InstanceState(x => x.CurrentState);
        
        Initially(
            When(SessionCreatedEventTriggered)
                .Then(context => /* set state data */)
                .TransitionTo(ValidatingSchedule)
                .Publish(context => new ValidateScheduleCommand { ... })
        );
        
        During(ValidatingSchedule,
            When(ScheduleValidationCompleted)
                .IfElse(context => context.Message.IsValid,
                    binder => binder.TransitionTo(SendingNotifications),
                    binder => binder.TransitionTo(SessionCancelled))
        );
    }
}
```

**State Machine Features:**
- Track saga state in database
- Automatic message correlation
- Conditional transitions based on event data
- Support for final states (SetCompletedWhenFinalized)
- Timeout handling
- Compensation logic

### 3. Consumers (Infrastructure/Messaging/Consumers)
**Purpose:** Handle commands and execute business logic

```csharp
public class ValidateScheduleConsumer : IConsumer<ValidateScheduleCommand>
{
    private readonly IRepository<Schedule, Guid> _scheduleRepository;
    
    public async Task Consume(ConsumeContext<ValidateScheduleCommand> context)
    {
        var message = context.Message;
        var schedule = await _scheduleRepository.GetByIdAsync(message.ScheduleId);
        
        bool isValid = schedule != null && schedule.StartTime > DateTime.UtcNow;
        
        var validationEvent = new ScheduleValidatedEvent
        {
            SessionId = message.SessionId,
            IsValid = isValid
        };
        
        await context.Publish(validationEvent);
    }
}
```

**Consumer Responsibilities:**
- Execute business logic (validation, database updates, external calls)
- Publish events for saga continuation
- Handle errors gracefully
- Provide detailed logging

### 4. Event Dispatcher (Infrastructure/Messaging)
**Purpose:** Publishes domain events to the message bus

```csharp
public class DomainEventDispatcher : IDomainEventDispatcher
{
    private readonly IPublishEndpoint _publishEndpoint;
    
    public async Task DispatchAsync(IDomainEvent domainEvent)
    {
        await _publishEndpoint.Publish(domainEvent, domainEvent.GetType());
    }
}
```

**Usage in Services:**
```csharp
// MentoringSessionServices
var sessionCreatedEvent = new MentoringSessionCreatedEvent
{
    SessionId = mentoringSession.Id,
    LearnerId = selectedUser.Id,
    MentorId = selectedSchedule.MentorId,
    ScheduleId = selectedSchedule.Id,
    CourseId = selectedCourse.Id,
    OccurredOn = DateTime.UtcNow
};

await _eventDispatcher.DispatchAsync(sessionCreatedEvent);
```

## Integration with Use Cases

### MentoringSessionServices
```csharp
public class MentoringSessionServices : IMentoringSessionServices
{
    private readonly IDomainEventDispatcher _eventDispatcher;
    
    public async Task<Result> CreateAsync(CreateSessionRequest sessionRequest)
    {
        // ... validation and creation logic ...
        
        var mentoringSession = new MentoringSession { ... };
        _mentoringSessionRepository.Add(mentoringSession);
        await _unitOfWork.SaveChangesAsync();
        
        // Publish domain event to trigger saga
        var sessionCreatedEvent = new MentoringSessionCreatedEvent
        {
            SessionId = mentoringSession.Id,
            // ... populate event data ...
        };
        
        await _eventDispatcher.DispatchAsync(sessionCreatedEvent);
        
        return Result<string>.Success("Session created successfully");
    }
}
```

### ApplicationRequestServices
```csharp
public class ApplicationRequestServices : IApplicationRequestServices
{
    private readonly IDomainEventDispatcher _eventDispatcher;
    
    public async Task<Result> CreateAsync(CreateApplicationRequestMentorRequest request)
    {
        // ... document upload and validation ...
        
        var applicationRequest = new ApplicationRequest { ... };
        _applicationRequestRepository.Add(applicationRequest);
        await _unitOfWork.SaveChangesAsync();
        
        // Trigger saga orchestration
        var requestSubmittedEvent = new ApplicationRequestSubmittedEvent
        {
            RequestId = applicationRequest.Id,
            UserId = currentUserId,
            SubmittedAt = DateTime.UtcNow
        };
        
        await _eventDispatcher.DispatchAsync(requestSubmittedEvent);
        
        return Result<string>.Success("Application submitted successfully");
    }
}
```

## Dependency Injection Configuration

### Infrastructure Layer (Extensions/DependencyInjection.cs)
```csharp
public static IServiceCollection ConfigureInfrastructureLayer(this IServiceCollection services)
{
    // ... other configurations ...
    
    return services
        .ConfigureInfrastructureServices()
        .ConfigureExecutionContext()
        .AddConfiguredMessageBus(config);  // Configures RabbitMQ and sagas
}
```

### Message Bus Configuration (Extensions/RabbitMQExtensions.cs)
```csharp
public static IServiceCollection AddRabbitMQMessageBus(this IServiceCollection services, IConfiguration configuration)
{
    services.AddMassTransit(x =>
    {
        // Register saga state machines
        x.AddSagaStateMachine<MentoringSessionStateMachine, MentoringSessionSagaState>()
            .InMemoryRepository();  // Use EntityFrameworkRepository in production
            
        x.AddSagaStateMachine<CourseEnrollmentStateMachine, CourseEnrollmentSagaState>()
            .InMemoryRepository();
            
        x.AddSagaStateMachine<ApplicationRequestStateMachine, ApplicationRequestSagaState>()
            .InMemoryRepository();
        
        // Register consumers
        x.AddConsumer<ValidateScheduleConsumer>();
        x.AddConsumer<SendSessionNotificationsConsumer>();
        // ... other consumers ...
        
        // Configure RabbitMQ transport
        x.UsingRabbitMq((context, cfg) =>
        {
            cfg.Host(rabbitMQOptions.Host, h =>
            {
                h.Username(rabbitMQOptions.Username);
                h.Password(rabbitMQOptions.Password);
            });
            
            // Retry policy
            cfg.UseMessageRetry(r => r.Incremental(
                retryLimit: 3,
                initialInterval: TimeSpan.FromSeconds(1),
                intervalIncrement: TimeSpan.FromSeconds(2)));
            
            cfg.ConfigureEndpoints(context);
        });
    });
    
    // Register event dispatcher
    services.AddDomainEventDispatcher();
    
    return services;
}
```

## Application Layer Configuration (Application/Extensions/DependencyInjection.cs)
```csharp
public static IServiceCollection ConfigureApplicationLayer(this IServiceCollection services)
{
    return services
        .ConfigureUseCases()
        .ConfigureCaching()
        .ConfigureFluentValidation();
}

public static IServiceCollection ConfigureUseCases(this IServiceCollection services)
{
    // Register all use case services
    services.AddScoped<IMentoringSessionServices, MentoringSessionServices>();
    services.AddScoped<ICourseServices, CourseServices>();
    services.AddScoped<IApplicationRequestServices, ApplicationRequestServices>();
    // ... other services ...
    
    return services;
}
```

## Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Mentoring Session Creation Flow                  │
└─────────────────────────────────────────────────────────────────────┘

User (Learner)
    │
    ├──> POST /api/sessions (CreateAsync)
    │
    └──> MentoringSessionServices
            │
            ├──> Validate input
            ├──> Create MentoringSession entity
            ├──> Save to database
            │
            └──> Publish Domain Event
                    │
                    └──> MentoringSessionCreatedEvent
                            │
                            │ (RabbitMQ Message)
                            │
                            ├──> MentoringSessionStateMachine
                            │        │
                            │        ├──> Set state to ValidatingSchedule
                            │        └──> Publish Command
                            │
                            └──> RabbitMQ Exchange
                                    │
                                    ├──> ValidateScheduleConsumer
                                    │        │
                                    │        ├──> Check schedule availability
                                    │        └──> Publish ScheduleValidatedEvent
                                    │
                                    └──> MentoringSessionStateMachine
                                            │
                                            ├──> Receive ScheduleValidatedEvent
                                            ├──> Set state to SendingNotifications
                                            └──> Publish Command
                                                    │
                                                    └──> SendSessionNotificationsConsumer
                                                            │
                                                            ├──> Load user details
                                                            ├──> Send emails
                                                            └──> Publish NotificationsSentEvent
                                                                    │
                                                                    └──> MentoringSessionStateMachine
                                                                            │
                                                                            ├──> Transition to SessionScheduled
                                                                            └──> Mark saga as completed
```

## Error Handling and Compensation

### Built-in Retry Mechanism
```csharp
cfg.UseMessageRetry(r => r.Incremental(
    retryLimit: 3,
    initialInterval: TimeSpan.FromSeconds(1),
    intervalIncrement: TimeSpan.FromSeconds(2)));
```

- Automatically retries failed messages
- Exponential backoff: 1s → 3s → 5s
- Dead letter queue for final failures

### Manual Compensation
```csharp
During(UnderReview,
    When(RejectionEvent)
        .Then(context =>
        {
            // Set rejection status
            context.Saga.ReviewStatus = 2;
            context.Saga.ReviewCompletedAt = context.Message.RejectedAt;
        })
        .TransitionTo(ApplicationRejected)  // Go to final rejected state
);
```

### Consumer Error Handling
```csharp
public async Task Consume(ConsumeContext<ValidateScheduleCommand> context)
{
    try
    {
        var schedule = await _scheduleRepository.GetByIdAsync(message.ScheduleId);
        // ... validation logic ...
        await context.Publish(validationEvent);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error validating schedule {ScheduleId}", message.ScheduleId);
        throw;  // MassTransit will handle retry via configured policy
    }
}
```

## Database Persistence (Production)

### Current Setup
```csharp
x.AddSagaStateMachine<MentoringSessionStateMachine, MentoringSessionSagaState>()
    .InMemoryRepository();  // Data lost on restart
```

### Production Setup (EF Core)
```csharp
x.AddSagaStateMachine<MentoringSessionStateMachine, MentoringSessionSagaState>()
    .EntityFrameworkRepository(r =>
    {
        r.ExistingDbContext<ApplicationDbContext>();
        // Add migration: AddMentoringSessionSagaState
    });
```

## Monitoring and Observability

### Consumer Logging
```csharp
_logger.LogInformation(
    "Validating schedule {ScheduleId} for session {SessionId}",
    message.ScheduleId,
    message.SessionId);
```

### Saga State Tracking
Saga state persists in database:
- Current state
- Key IDs for correlation
- Timestamps for state transitions
- Failure reasons
- Retry counts

### RabbitMQ Monitoring
- Monitor queue depths
- Track message delivery rates
- Analyze dead letter queue
- Monitor consumer performance

## Testing Saga Workflows

### Unit Test Example
```csharp
[Test]
public async Task CreateSession_ShouldPublishMentoringSessionCreatedEvent()
{
    // Arrange
    var eventDispatcher = new Mock<IDomainEventDispatcher>();
    var service = new MentoringSessionServices(
        mentoringSessionRepository,
        unitOfWork,
        executionContext,
        // ... other dependencies ...
        eventDispatcher.Object,
        logger);
    
    // Act
    await service.CreateAsync(createRequest);
    
    // Assert
    eventDispatcher.Verify(
        x => x.DispatchAsync(It.IsAny<MentoringSessionCreatedEvent>()),
        Times.Once);
}
```

### Integration Test Example
```csharp
[Test]
public async Task MentoringSessionSaga_ShouldCompleteSuccessfully()
{
    // Start RabbitMQ test container
    var rabbitFixture = new RabbitMQTestFixture();
    await rabbitFixture.InitializeAsync();
    
    // Trigger saga
    var sessionId = await mentoringService.CreateAsync(createRequest);
    
    // Wait for saga completion
    await Task.Delay(2000);
    
    // Verify final state
    var sagaState = await rabbitFixture.GetSagaState(sessionId);
    Assert.AreEqual("SessionScheduled", sagaState.CurrentState);
}
```

## Best Practices

1. **Idempotency:** Make consumers idempotent - can safely process same message multiple times
2. **Logging:** Log all state transitions and command/event processing
3. **Compensation:** Plan compensating actions for failures
4. **Timeouts:** Set timeouts for long-running steps
5. **Dead Letters:** Monitor dead letter queues for failed messages
6. **Testing:** Test saga flows end-to-end
7. **Versioning:** Version saga state machines and events for compatibility
8. **Performance:** Use correlation IDs to track saga instances

## Summary

The saga orchestrator implementation provides:
- ✅ Asynchronous, decoupled service orchestration
- ✅ Complex multi-step workflow management
- ✅ Automatic retry with exponential backoff
- ✅ Event-driven architecture
- ✅ Clear separation of concerns
- ✅ Production-ready error handling
- ✅ Easy testing and monitoring

This ensures robust, scalable, and maintainable business process orchestration across the MentorPlatform backend.
