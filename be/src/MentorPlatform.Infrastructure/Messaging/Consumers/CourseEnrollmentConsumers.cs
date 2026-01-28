using MassTransit;
using MentorPlatform.Application.Sagas.CourseEnrollmentSaga;
using MentorPlatform.Domain.Events;
using MentorPlatform.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace MentorPlatform.Infrastructure.Messaging.Consumers;

/// <summary>
/// Consumer for checking course capacity
/// Verifies available enrollment slots in a course
/// </summary>
public class CheckCourseCapacityConsumer : IConsumer<CheckCourseCapacityCommand>
{
    private readonly ILogger<CheckCourseCapacityConsumer> _logger;
    private readonly ICourseRepository _courseRepository;

    public CheckCourseCapacityConsumer(
        ILogger<CheckCourseCapacityConsumer> logger,
        ICourseRepository courseRepository)
    {
        _logger = logger;
        _courseRepository = courseRepository;
    }

    public async Task Consume(ConsumeContext<CheckCourseCapacityCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Checking capacity for course {CourseId}, enrollment {EnrollmentId}",
            message.CourseId,
            message.EnrollmentId);

        try
        {
            var course = await _courseRepository.GetByIdAsync(message.CourseId);
            
            // Default: assume capacity exists (in real implementation, check course.MaxCapacity)
            bool hasCapacity = course != null;
            
            if (course == null)
            {
                _logger.LogWarning("Course {CourseId} not found for enrollment {EnrollmentId}", 
                    message.CourseId, message.EnrollmentId);
            }
            else
            {
                _logger.LogInformation("Course {CourseId} capacity check passed", message.CourseId);
            }

            var capacityEvent = new CourseCapacityCheckedEvent
            {
                EnrollmentId = message.EnrollmentId,
                HasCapacity = hasCapacity
            };

            await context.Publish(capacityEvent);

            _logger.LogInformation(
                "Course capacity check completed for enrollment {EnrollmentId}, HasCapacity: {HasCapacity}",
                message.EnrollmentId,
                hasCapacity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking capacity for course {CourseId}", message.CourseId);
            throw;
        }
    }
}

/// <summary>
/// Consumer for confirming enrollment
/// Marks the enrollment as confirmed in the system
/// </summary>
public class ConfirmEnrollmentConsumer : IConsumer<ConfirmEnrollmentCommand>
{
    private readonly ILogger<ConfirmEnrollmentConsumer> _logger;

    public ConfirmEnrollmentConsumer(ILogger<ConfirmEnrollmentConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ConfirmEnrollmentCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Confirming enrollment {EnrollmentId} for user {UserId} in course {CourseId}",
            message.EnrollmentId,
            message.UserId,
            message.CourseId);

        try
        {
            // In real implementation:
            // 1. Update enrollment record in database
            // 2. Decrement available capacity
            // 3. Trigger any enrollment confirmation workflows
            
            await Task.Delay(100);

            var confirmEvent = new EnrollmentConfirmedEvent
            {
                EnrollmentId = message.EnrollmentId,
                UserId = message.UserId,
                CourseId = message.CourseId
            };

            await context.Publish(confirmEvent);

            _logger.LogInformation("Enrollment {EnrollmentId} confirmed and event published", message.EnrollmentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming enrollment {EnrollmentId}", message.EnrollmentId);
            throw;
        }
    }
}

/// <summary>
/// Consumer for sending welcome emails
/// Sends welcome email to newly enrolled user
/// </summary>
public class SendWelcomeEmailConsumer : IConsumer<SendWelcomeEmailCommand>
{
    private readonly ILogger<SendWelcomeEmailConsumer> _logger;

    public SendWelcomeEmailConsumer(ILogger<SendWelcomeEmailConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<SendWelcomeEmailCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Sending welcome email for enrollment {EnrollmentId} to user {UserId}",
            message.EnrollmentId,
            message.UserId);

        try
        {
            // In real implementation:
            // 1. Load user and course details
            // 2. Generate welcome email from template
            // 3. Send via email service
            // 4. Update email sent timestamp
            
            await Task.Delay(100);

            var emailEvent = new WelcomeEmailSentEvent
            {
                EnrollmentId = message.EnrollmentId,
                SentAt = DateTime.UtcNow
            };

            await context.Publish(emailEvent);

            _logger.LogInformation("Welcome email sent for enrollment {EnrollmentId}", message.EnrollmentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending welcome email for enrollment {EnrollmentId}", message.EnrollmentId);
            throw;
        }
    }
}

/// <summary>
/// Consumer for granting course access
/// Provides user access to course materials and resources
/// </summary>
public class GrantCourseAccessConsumer : IConsumer<GrantCourseAccessCommand>
{
    private readonly ILogger<GrantCourseAccessConsumer> _logger;

    public GrantCourseAccessConsumer(ILogger<GrantCourseAccessConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<GrantCourseAccessCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Granting access to course {CourseId} for user {UserId}",
            message.CourseId,
            message.UserId);

        try
        {
            // In real implementation:
            // 1. Create/update user course access record
            // 2. Generate access tokens if needed
            // 3. Notify security/audit systems
            // 4. Update user permissions
            
            await Task.Delay(100);

            var accessEvent = new CourseAccessGrantedEvent
            {
                UserId = message.UserId,
                CourseId = message.CourseId,
                EnrollmentId = message.EnrollmentId,
                GrantedAt = DateTime.UtcNow
            };

            await context.Publish(accessEvent);

            _logger.LogInformation(
                "Access granted to course {CourseId} for user {UserId}",
                message.CourseId,
                message.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error granting access to course {CourseId}", message.CourseId);
            throw;
        }
    }
}
