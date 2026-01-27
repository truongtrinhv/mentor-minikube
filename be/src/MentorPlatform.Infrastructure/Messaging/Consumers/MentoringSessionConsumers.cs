using MassTransit;
using MentorPlatform.Application.Sagas.MentoringSessionSaga;
using Microsoft.Extensions.Logging;

namespace MentorPlatform.Infrastructure.Messaging.Consumers;

/// <summary>
/// Consumer for validating mentoring session schedules
/// </summary>
public class ValidateScheduleConsumer : IConsumer<ValidateScheduleCommand>
{
    private readonly ILogger<ValidateScheduleConsumer> _logger;

    public ValidateScheduleConsumer(ILogger<ValidateScheduleConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ValidateScheduleCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Validating schedule {ScheduleId} for session {SessionId}",
            message.ScheduleId,
            message.SessionId);

        try
        {
            // Simulate schedule validation logic
            // In real implementation, this would check database for conflicts, availability, etc.
            var isValid = true;

            var validationEvent = new ScheduleValidatedEvent
            {
                SessionId = message.SessionId,
                IsValid = isValid
            };

            await context.Publish(validationEvent);

            _logger.LogInformation(
                "Schedule validation completed for session {SessionId}, IsValid: {IsValid}",
                message.SessionId,
                isValid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating schedule for session {SessionId}", message.SessionId);
            throw;
        }
    }
}

/// <summary>
/// Consumer for sending session notifications
/// </summary>
public class SendSessionNotificationsConsumer : IConsumer<SendSessionNotificationsCommand>
{
    private readonly ILogger<SendSessionNotificationsConsumer> _logger;

    public SendSessionNotificationsConsumer(ILogger<SendSessionNotificationsConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<SendSessionNotificationsCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Sending notifications for session {SessionId} to learner {LearnerId} and mentor {MentorId}",
            message.SessionId,
            message.LearnerId,
            message.MentorId);

        try
        {
            // Simulate email/notification sending
            await Task.Delay(100); // Simulate async work

            var notificationEvent = new NotificationsSentEvent
            {
                SessionId = message.SessionId,
                SentAt = DateTime.UtcNow
            };

            await context.Publish(notificationEvent);

            _logger.LogInformation(
                "Notifications sent for session {SessionId}",
                message.SessionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notifications for session {SessionId}", message.SessionId);
            throw;
        }
    }
}
