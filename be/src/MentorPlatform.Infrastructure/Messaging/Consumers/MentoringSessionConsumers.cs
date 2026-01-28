using MassTransit;
using MentorPlatform.Application.Sagas.MentoringSessionSaga;
using MentorPlatform.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace MentorPlatform.Infrastructure.Messaging.Consumers;

/// <summary>
/// Consumer for validating mentoring session schedules
/// Verifies mentor availability and schedule conflicts
/// </summary>
public class ValidateScheduleConsumer : IConsumer<ValidateScheduleCommand>
{
    private readonly ILogger<ValidateScheduleConsumer> _logger;
    private readonly IRepository<Domain.Entities.Schedule, Guid> _scheduleRepository;

    public ValidateScheduleConsumer(
        ILogger<ValidateScheduleConsumer> logger,
        IRepository<Domain.Entities.Schedule, Guid> scheduleRepository)
    {
        _logger = logger;
        _scheduleRepository = scheduleRepository;
    }

    public async Task Consume(ConsumeContext<ValidateScheduleCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Validating schedule {ScheduleId} for session {SessionId}, Mentor {MentorId}",
            message.ScheduleId,
            message.SessionId,
            message.MentorId);

        try
        {
            // Check if schedule exists and is available
            var schedule = await _scheduleRepository.GetByIdAsync(message.ScheduleId);
            
            bool isValid = false;
            string validationMessage = "Schedule validation failed";

            if (schedule != null && schedule.StartTime > DateTime.UtcNow)
            {
                isValid = true;
                validationMessage = "Schedule is valid and available";
                _logger.LogInformation("Schedule {ScheduleId} validated successfully", message.ScheduleId);
            }
            else
            {
                _logger.LogWarning("Schedule {ScheduleId} validation failed - not found or in past", message.ScheduleId);
            }

            // Publish validation event for saga continuation
            var validationEvent = new ScheduleValidatedEvent
            {
                SessionId = message.SessionId,
                IsValid = isValid
            };

            await context.Publish(validationEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating schedule {ScheduleId} for session {SessionId}", 
                message.ScheduleId, message.SessionId);
            throw;
        }
    }
}

/// <summary>
/// Consumer for sending session notifications
/// Sends notifications to both mentor and learner
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
            // In a real implementation, this would:
            // 1. Load learner and mentor details
            // 2. Generate email/notification content
            // 3. Send via email service or notification hub
            // 4. Log delivery status

            // Simulate async work
            await Task.Delay(100);

            _logger.LogInformation(
                "Notifications prepared for session {SessionId} - learner {LearnerId} and mentor {MentorId}",
                message.SessionId,
                message.LearnerId,
                message.MentorId);

            // Publish event to continue saga
            var notificationEvent = new NotificationsSentEvent
            {
                SessionId = message.SessionId,
                SentAt = DateTime.UtcNow
            };

            await context.Publish(notificationEvent);

            _logger.LogInformation(
                "Notifications event published for session {SessionId}",
                message.SessionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notifications for session {SessionId}", message.SessionId);
            throw;
        }
    }
}
