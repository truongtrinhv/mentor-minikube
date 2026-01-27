using MassTransit;
using MentorPlatform.Application.Sagas.ApplicationRequestSaga;
using MentorPlatform.Domain.Events;
using Microsoft.Extensions.Logging;

namespace MentorPlatform.Infrastructure.Messaging.Consumers;

/// <summary>
/// Consumer for validating application documents
/// </summary>
public class ValidateDocumentsConsumer : IConsumer<ValidateDocumentsCommand>
{
    private readonly ILogger<ValidateDocumentsConsumer> _logger;

    public ValidateDocumentsConsumer(ILogger<ValidateDocumentsConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ValidateDocumentsCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Validating documents for application {RequestId} from user {UserId}",
            message.RequestId,
            message.UserId);

        try
        {
            // Simulate document validation
            var isValid = true;

            var validationEvent = new DocumentsValidatedEvent
            {
                RequestId = message.RequestId,
                IsValid = isValid,
                ValidationMessage = isValid ? "All documents valid" : "Missing required documents"
            };

            await context.Publish(validationEvent);

            _logger.LogInformation(
                "Document validation completed for application {RequestId}, IsValid: {IsValid}",
                message.RequestId,
                isValid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating documents for application {RequestId}", message.RequestId);
            throw;
        }
    }
}

/// <summary>
/// Consumer for requesting background checks
/// </summary>
public class RequestBackgroundCheckConsumer : IConsumer<RequestBackgroundCheckCommand>
{
    private readonly ILogger<RequestBackgroundCheckConsumer> _logger;

    public RequestBackgroundCheckConsumer(ILogger<RequestBackgroundCheckConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<RequestBackgroundCheckCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Requesting background check for application {RequestId}, user {UserId}",
            message.RequestId,
            message.UserId);

        try
        {
            // Simulate background check request
            await Task.Delay(100);

            var backgroundEvent = new BackgroundCheckCompletedEvent
            {
                RequestId = message.RequestId,
                Passed = true,
                CheckDetails = "Background check passed"
            };

            await context.Publish(backgroundEvent);

            _logger.LogInformation(
                "Background check completed for application {RequestId}, Passed: {Passed}",
                message.RequestId,
                backgroundEvent.Passed);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting background check for application {RequestId}", message.RequestId);
            throw;
        }
    }
}

/// <summary>
/// Consumer for assigning reviewers
/// </summary>
public class AssignReviewerConsumer : IConsumer<AssignReviewerCommand>
{
    private readonly ILogger<AssignReviewerConsumer> _logger;

    public AssignReviewerConsumer(ILogger<AssignReviewerConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<AssignReviewerCommand> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Assigning reviewer for application {RequestId}",
            message.RequestId);

        try
        {
            // Simulate reviewer assignment
            var reviewerId = Guid.NewGuid();
            await Task.Delay(100);

            var assignmentEvent = new ReviewerAssignedEvent
            {
                RequestId = message.RequestId,
                ReviewerId = reviewerId,
                AssignedAt = DateTime.UtcNow
            };

            await context.Publish(assignmentEvent);

            _logger.LogInformation(
                "Reviewer {ReviewerId} assigned to application {RequestId}",
                reviewerId,
                message.RequestId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning reviewer for application {RequestId}", message.RequestId);
            throw;
        }
    }
}

/// <summary>
/// Consumer for sending application notifications
/// </summary>
public class SendApplicationNotificationConsumer : IConsumer<SendApplicationNotificationCommand>
{
    private readonly ILogger<SendApplicationNotificationConsumer> _logger;

    public SendApplicationNotificationConsumer(ILogger<SendApplicationNotificationConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<SendApplicationNotificationCommand> context)
    {
        var message = context.Message;
        var statusText = message.Status == 1 ? "Approved" : "Rejected";

        _logger.LogInformation(
            "Sending {Status} notification for application {RequestId} to user {UserId}",
            statusText,
            message.RequestId,
            message.UserId);

        try
        {
            // Simulate notification sending
            await Task.Delay(100);

            _logger.LogInformation(
                "{Status} notification sent for application {RequestId}",
                statusText,
                message.RequestId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for application {RequestId}", message.RequestId);
            throw;
        }
    }
}
