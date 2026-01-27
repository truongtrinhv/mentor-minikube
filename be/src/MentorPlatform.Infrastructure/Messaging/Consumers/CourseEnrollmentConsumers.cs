using MassTransit;
using MentorPlatform.Application.Sagas.CourseEnrollmentSaga;
using MentorPlatform.Domain.Events;
using Microsoft.Extensions.Logging;

namespace MentorPlatform.Infrastructure.Messaging.Consumers;

/// <summary>
/// Consumer for checking course capacity
/// </summary>
public class CheckCourseCapacityConsumer : IConsumer<CheckCourseCapacityCommand>
{
    private readonly ILogger<CheckCourseCapacityConsumer> _logger;

    public CheckCourseCapacityConsumer(ILogger<CheckCourseCapacityConsumer> logger)
    {
        _logger = logger;
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
            // Simulate course capacity check
            // In real implementation, would query course and check enrollment limits
            var hasCapacity = true;

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
            // Simulate enrollment confirmation
            await Task.Delay(100);

            var confirmEvent = new EnrollmentConfirmedEvent
            {
                EnrollmentId = message.EnrollmentId,
                UserId = message.UserId,
                CourseId = message.CourseId
            };

            await context.Publish(confirmEvent);

            _logger.LogInformation("Enrollment {EnrollmentId} confirmed", message.EnrollmentId);
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
            "Sending welcome email for enrollment {EnrollmentId}",
            message.EnrollmentId);

        try
        {
            // Simulate email sending
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
            // Simulate access granting
            await Task.Delay(100);

            var accessEvent = new CourseAccessGrantedEvent
            {
                UserId = message.UserId,
                CourseId = message.CourseId,
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
