# RabbitMQ Service Integration Guide

## How to Integrate RabbitMQ Event Publishing into Your Services

This guide shows how to integrate domain event publishing into the MentorPlatform services.

## Integration Pattern

### Step 1: Inject Event Dispatcher

Add `IDomainEventDispatcher` to your service constructor:

```csharp
public class MentoringSessionServices : IMentoringSessionServices
{
    private readonly IMentoringSessionRepository _sessionRepository;
    private readonly IDomainEventDispatcher _eventDispatcher;
    private readonly ILogger<MentoringSessionServices> _logger;
    
    public MentoringSessionServices(
        IMentoringSessionRepository sessionRepository,
        IDomainEventDispatcher eventDispatcher,
        ILogger<MentoringSessionServices> logger)
    {
        _sessionRepository = sessionRepository;
        _eventDispatcher = eventDispatcher;
        _logger = logger;
    }
}
```

### Step 2: Publish Events on Key Operations

#### Creating a Mentoring Session

```csharp
public async Task<Result> CreateAsync(CreateSessionRequest sessionRequest)
{
    var selectedUser = _executionContext.GetUser();
    
    if (selectedUser!.Role != Role.Learner)
    {
        return Result.Failure(MentoringSessionErrors.OnlyLeanerCanCreateRequest);
    }

    // Validate and create session...
    var session = new MentoringSession
    {
        LearnerId = selectedUser.Id,
        MentorId = sessionRequest.MentorId,
        ScheduleId = sessionRequest.ScheduleId,
        CourseId = sessionRequest.CourseId,
        SessionType = sessionRequest.SessionType,
        RequestStatus = RequestMentoringSessionStatus.Pending
    };

    // Add to repository
    await _sessionRepository.AddAsync(session);
    await _unitOfWork.SaveChangesAsync();

    // Publish domain event
    var domainEvent = new MentoringSessionCreatedEvent
    {
        SessionId = session.Id,
        LearnerId = session.LearnerId,
        MentorId = session.MentorId,
        ScheduleId = session.ScheduleId,
        CourseId = session.CourseId,
        SessionType = (int)session.SessionType
    };

    try
    {
        await _eventDispatcher.DispatchAsync(domainEvent);
        _logger.LogInformation(
            "Mentoring session {SessionId} created and event published", 
            session.Id);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, 
            "Failed to publish event for session {SessionId}", 
            session.Id);
        // Decide: fail fast or continue? Usually continue if event publication fails
    }

    return Result.Success(session.Id);
}
```

#### Status Change Events

```csharp
public async Task<Result> UpdateSessionStatusAsync(
    Guid sessionId, 
    RequestMentoringSessionStatus newStatus, 
    string? reason = null)
{
    var session = await _sessionRepository.GetByIdAsync(sessionId);
    if (session is null)
    {
        return Result.Failure(MentoringSessionErrors.SessionNotFound);
    }

    var oldStatus = session.RequestStatus;
    session.RequestStatus = newStatus;

    await _unitOfWork.SaveChangesAsync();

    // Publish status change event
    var statusChangeEvent = new MentoringSessionStatusChangedEvent
    {
        SessionId = session.Id,
        OldStatus = (int)oldStatus,
        NewStatus = (int)newStatus,
        LearnerId = session.LearnerId,
        MentorId = session.MentorId
    };

    try
    {
        await _eventDispatcher.DispatchAsync(statusChangeEvent);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to publish status change event for session {SessionId}", sessionId);
    }

    return Result.Success();
}
```

#### Completion Events

```csharp
public async Task<Result> CompleteSessionAsync(Guid sessionId)
{
    var session = await _sessionRepository.GetByIdAsync(sessionId);
    if (session is null)
    {
        return Result.Failure(MentoringSessionErrors.SessionNotFound);
    }

    session.RequestStatus = RequestMentoringSessionStatus.Completed;
    session.CompletedAt = DateTime.UtcNow;

    await _unitOfWork.SaveChangesAsync();

    // Publish completion event
    var completionEvent = new MentoringSessionCompletedEvent
    {
        SessionId = session.Id,
        LearnerId = session.LearnerId,
        MentorId = session.MentorId,
        CompletedAt = session.CompletedAt.Value
    };

    try
    {
        await _eventDispatcher.DispatchAsync(completionEvent);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to publish completion event for session {SessionId}", sessionId);
    }

    return Result.Success();
}
```

### Step 3: Application Request Service Integration

```csharp
public class ApplicationRequestServices : IApplicationRequestServices
{
    private readonly IApplicationRequestRepository _applicationRequestRepository;
    private readonly IDomainEventDispatcher _eventDispatcher;
    private readonly ILogger<ApplicationRequestServices> _logger;
    
    public ApplicationRequestServices(
        IApplicationRequestRepository applicationRequestRepository,
        IDomainEventDispatcher eventDispatcher,
        ILogger<ApplicationRequestServices> logger)
    {
        _applicationRequestRepository = applicationRequestRepository;
        _eventDispatcher = eventDispatcher;
        _logger = logger;
    }

    public async Task<Result> SubmitApplicationAsync(SubmitApplicationRequest request)
    {
        var userId = _executionContext.GetUser()!.Id;
        
        var applicationRequest = new ApplicationRequest
        {
            UserId = userId,
            Status = ApplicationRequestStatus.Pending,
            SubmittedAt = DateTime.UtcNow
            // ... other properties
        };

        await _applicationRequestRepository.AddAsync(applicationRequest);
        await _unitOfWork.SaveChangesAsync();

        // Publish submission event
        var submissionEvent = new ApplicationRequestSubmittedEvent
        {
            RequestId = applicationRequest.Id,
            UserId = userId,
            SubmittedAt = applicationRequest.SubmittedAt
        };

        try
        {
            await _eventDispatcher.DispatchAsync(submissionEvent);
            _logger.LogInformation(
                "Application request {RequestId} submitted by user {UserId}", 
                applicationRequest.Id, 
                userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Failed to publish event for application request {RequestId}", 
                applicationRequest.Id);
        }

        return Result.Success(applicationRequest.Id);
    }

    public async Task<Result> ApproveApplicationAsync(
        Guid requestId, 
        Guid approverId, 
        string? remarks = null)
    {
        var request = await _applicationRequestRepository.GetByIdAsync(requestId);
        if (request is null)
        {
            return Result.Failure("Application request not found");
        }

        request.Status = ApplicationRequestStatus.Approved;
        request.ApprovedAt = DateTime.UtcNow;
        request.ApprovedBy = approverId;
        request.Remarks = remarks;

        await _unitOfWork.SaveChangesAsync();

        // Publish approval event
        var approvalEvent = new ApplicationApprovedEvent
        {
            RequestId = request.Id,
            UserId = request.UserId,
            ApprovedAt = request.ApprovedAt.Value,
            ApprovedBy = approverId
        };

        try
        {
            await _eventDispatcher.DispatchAsync(approvalEvent);
            _logger.LogInformation(
                "Application request {RequestId} approved by {ApproverId}", 
                requestId, 
                approverId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Failed to publish approval event for application request {RequestId}", 
                requestId);
        }

        return Result.Success();
    }

    public async Task<Result> RejectApplicationAsync(
        Guid requestId, 
        Guid rejectedBy, 
        string rejectionReason)
    {
        var request = await _applicationRequestRepository.GetByIdAsync(requestId);
        if (request is null)
        {
            return Result.Failure("Application request not found");
        }

        request.Status = ApplicationRequestStatus.Rejected;
        request.RejectedAt = DateTime.UtcNow;
        request.RejectedBy = rejectedBy;
        request.RejectionReason = rejectionReason;

        await _unitOfWork.SaveChangesAsync();

        // Publish rejection event
        var rejectionEvent = new ApplicationRejectedEvent
        {
            RequestId = request.Id,
            UserId = request.UserId,
            RejectedAt = request.RejectedAt.Value,
            RejectedBy = rejectedBy,
            RejectionReason = rejectionReason
        };

        try
        {
            await _eventDispatcher.DispatchAsync(rejectionEvent);
            _logger.LogInformation(
                "Application request {RequestId} rejected by {RejectedBy}", 
                requestId, 
                rejectedBy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Failed to publish rejection event for application request {RequestId}", 
                requestId);
        }

        return Result.Success();
    }
}
```

### Step 4: Course Enrollment Integration

```csharp
public class CourseServices : ICourseServices
{
    private readonly ICourseRepository _courseRepository;
    private readonly IUserRepository _userRepository;
    private readonly IDomainEventDispatcher _eventDispatcher;
    private readonly ILogger<CourseServices> _logger;
    
    public CourseServices(
        ICourseRepository courseRepository,
        IUserRepository userRepository,
        IDomainEventDispatcher eventDispatcher,
        ILogger<CourseServices> logger)
    {
        _courseRepository = courseRepository;
        _userRepository = userRepository;
        _eventDispatcher = eventDispatcher;
        _logger = logger;
    }

    public async Task<Result> EnrollUserAsync(Guid courseId, Guid userId)
    {
        var course = await _courseRepository.GetByIdAsync(courseId);
        var user = await _userRepository.GetByIdAsync(userId);

        if (course is null || user is null)
        {
            return Result.Failure("Course or user not found");
        }

        // Check capacity and create enrollment
        var enrollment = new CourseEnrollment
        {
            CourseId = courseId,
            UserId = userId,
            EnrolledAt = DateTime.UtcNow
        };

        await _courseRepository.AddEnrollmentAsync(enrollment);
        await _unitOfWork.SaveChangesAsync();

        // Publish enrollment event
        var enrollmentEvent = new CourseEnrolledEvent
        {
            EnrollmentId = enrollment.Id,
            UserId = userId,
            CourseId = courseId,
            EnrolledAt = enrollment.EnrolledAt
        };

        try
        {
            await _eventDispatcher.DispatchAsync(enrollmentEvent);
            _logger.LogInformation(
                "User {UserId} enrolled in course {CourseId}", 
                userId, 
                courseId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Failed to publish enrollment event for user {UserId} and course {CourseId}", 
                userId, 
                courseId);
        }

        return Result.Success(enrollment.Id);
    }
}
```

## Error Handling Strategies

### Strategy 1: Fire and Forget (Recommended for Non-Critical Events)

```csharp
// Continue even if event publishing fails
try
{
    await _eventDispatcher.DispatchAsync(domainEvent);
}
catch (Exception ex)
{
    _logger.LogError(ex, "Event publication failed but operation succeeded");
    // Continue - operation is already committed
}
```

### Strategy 2: Fail Fast (For Critical Workflows)

```csharp
// Fail if event publishing fails
try
{
    await _eventDispatcher.DispatchAsync(domainEvent);
}
catch (Exception ex)
{
    _logger.LogError(ex, "Critical event publication failed");
    throw; // Propagate failure
}
```

### Strategy 3: Retry with Exponential Backoff

```csharp
public async Task DispatchWithRetryAsync(IDomainEvent domainEvent, int maxRetries = 3)
{
    int attempt = 0;
    while (attempt < maxRetries)
    {
        try
        {
            await _eventDispatcher.DispatchAsync(domainEvent);
            return;
        }
        catch (Exception ex) when (attempt < maxRetries - 1)
        {
            attempt++;
            int delay = (int)Math.Pow(2, attempt) * 1000; // Exponential backoff
            _logger.LogWarning(ex, "Event dispatch attempt {Attempt} failed, retrying in {Delay}ms", attempt, delay);
            await Task.Delay(delay);
        }
    }
    
    throw new Exception($"Failed to dispatch event after {maxRetries} attempts");
}
```

## Testing

### Unit Testing Events

```csharp
[Test]
public async Task CreateSession_ShouldPublishEvent()
{
    // Arrange
    var mockDispatcher = new Mock<IDomainEventDispatcher>();
    var service = new MentoringSessionServices(
        mockRepository, 
        mockDispatcher.Object, 
        mockLogger);

    // Act
    await service.CreateAsync(createRequest);

    // Assert
    mockDispatcher.Verify(
        x => x.DispatchAsync(It.IsAny<MentoringSessionCreatedEvent>()),
        Times.Once);
}
```

### Integration Testing

```csharp
[Test]
public async Task CreateSession_ShouldTriggerSagaOrchestration()
{
    // Arrange - Start RabbitMQ test container
    var rabbitFixture = new RabbitMQTestFixture();
    await rabbitFixture.InitializeAsync();

    // Act
    var sessionId = await mentoringService.CreateAsync(createRequest);

    // Assert - Verify saga states
    await Task.Delay(1000); // Wait for async processing
    var sagaState = await rabbitFixture.GetSagaState(sessionId);
    Assert.AreEqual("SessionScheduled", sagaState.CurrentState);
}
```

## Monitoring Published Events

### Logging Best Practices

```csharp
_logger.LogInformation(
    "Domain event published: EventType={EventType}, EventId={EventId}, AggregateId={AggregateId}",
    domainEvent.EventType,
    domainEvent.EventId,
    sessionId);
```

### Structured Logging with Serilog

```csharp
_logger.LogInformation(
    "MentoringSessionCreatedEvent published {@Event}",
    new { 
        SessionId = domainEvent.SessionId,
        LearnerId = domainEvent.LearnerId,
        MentorId = domainEvent.MentorId,
        Timestamp = domainEvent.OccurredOn
    });
```

## Common Patterns

### Atomicity with Database + Events

```csharp
using (var transaction = await _unitOfWork.BeginTransactionAsync())
{
    try
    {
        // 1. Update database
        await _sessionRepository.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

        // 2. Publish events (after commit)
        await _eventDispatcher.DispatchAsync(domainEvent);

        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

### Batch Event Publishing

```csharp
public async Task PublishMultipleEventsAsync(params IDomainEvent[] events)
{
    var eventList = events.ToList();
    _logger.LogInformation("Publishing {Count} events", eventList.Count);
    
    try
    {
        await _eventDispatcher.DispatchAsync(eventList);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Batch event publication failed");
        throw;
    }
}
```

## Summary

To integrate RabbitMQ event publishing:

1. ✅ Inject `IDomainEventDispatcher`
2. ✅ Create appropriate domain events
3. ✅ Publish events after business operations
4. ✅ Handle errors appropriately
5. ✅ Log all publications
6. ✅ Test event publishing

See [RABBITMQ_INTEGRATION_GUIDE.md](RABBITMQ_INTEGRATION_GUIDE.md) for more details.
